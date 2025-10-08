-- Migration: Add Settlement Provider Tracking
-- Purpose: Support multiple settlement providers (Circle, Wise, etc) with telemetry
-- Date: 2025-10-08

-- ============================================
-- 1) Add settlement columns to payments table
-- ============================================

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS settlement_provider text 
  CHECK (settlement_provider IN ('none', 'circle', 'wise', 'mercadopago'));

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS settlement_id text;

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS settlement_currency text;

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS settlement_amount numeric(10,2);

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS settlement_fee numeric(10,2);

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS settlement_requested_at timestamptz;

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS settlement_completed_at timestamptz;

-- Add comments
COMMENT ON COLUMN public.payments.settlement_provider IS 
  'Settlement provider used for fiat off-ramp (none = crypto-only)';

COMMENT ON COLUMN public.payments.settlement_id IS 
  'External settlement/payout ID from provider (Circle payout ID, Wise transfer ID, etc)';

COMMENT ON COLUMN public.payments.settlement_currency IS 
  'Fiat currency used for settlement (USD, BRL, EUR, etc)';

COMMENT ON COLUMN public.payments.settlement_amount IS 
  'Amount received in fiat after conversion and fees';

COMMENT ON COLUMN public.payments.settlement_fee IS 
  'Fee charged by settlement provider';

-- ============================================
-- 2) Create webhook_events table for audit trail
-- ============================================

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  signature text,
  processed boolean DEFAULT false,
  processing_time_ms integer,
  error_message text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS webhook_events_provider_type_idx 
  ON public.webhook_events(provider, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS webhook_events_processed_idx 
  ON public.webhook_events(processed, created_at DESC) 
  WHERE NOT processed;

-- Add comments
COMMENT ON TABLE public.webhook_events IS 
  'Audit trail for all webhook events from settlement providers';

-- ============================================
-- 3) Update mark_settled RPC function
-- ============================================

-- Drop existing function first (may have different signature)
DROP FUNCTION IF EXISTS app.mark_settled(text);
DROP FUNCTION IF EXISTS app.mark_settled(text, text);
DROP FUNCTION IF EXISTS app.mark_settled(text, text, text, text, numeric, numeric);

CREATE OR REPLACE FUNCTION app.mark_settled(
  _ref text,
  _provider text DEFAULT 'none',
  _settlement_id text DEFAULT NULL,
  _currency text DEFAULT NULL,
  _amount numeric DEFAULT NULL,
  _fee numeric DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.payments p
  SET 
    status = 'settled',
    settlement_provider = _provider,
    settlement_id = _settlement_id,
    settlement_currency = _currency,
    settlement_amount = _amount,
    settlement_fee = _fee,
    settlement_completed_at = now(),
    settled_at = now()
  FROM public.invoices i
  WHERE p.invoice_id = i.id
    AND i.ref = _ref
    AND i.merchant_id = app.current_merchant();
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found or not owned by current merchant: %', _ref;
  END IF;
END;
$$;

COMMENT ON FUNCTION app.mark_settled IS 
  'Mark payment as settled with provider details. Only updates payments owned by current merchant (RLS).';

-- ============================================
-- 4) Create settlement dashboard view
-- ============================================

CREATE OR REPLACE VIEW app.settlement_dashboard AS
SELECT 
  DATE(p.created_at) as date,
  COUNT(*) as total_payments,
  SUM(CASE WHEN p.status = 'confirmed' AND (p.settlement_provider IS NULL OR p.settlement_provider = 'none') THEN 1 ELSE 0 END) as crypto_only,
  SUM(CASE WHEN p.status = 'settled' THEN 1 ELSE 0 END) as settled_to_fiat,
  SUM(i.amount_brl) as total_volume_brl,
  SUM(p.settlement_amount) as settled_volume,
  SUM(p.settlement_fee) as total_fees,
  COALESCE(AVG(
    EXTRACT(EPOCH FROM (p.settlement_completed_at - p.settlement_requested_at))
  ), 0) as avg_settlement_time_seconds
FROM public.payments p
JOIN public.invoices i ON i.id = p.invoice_id
WHERE i.merchant_id = app.current_merchant()
  AND p.created_at >= now() - interval '30 days'
  AND p.status IN ('confirmed', 'settled')
GROUP BY DATE(p.created_at)
ORDER BY date DESC;

COMMENT ON VIEW app.settlement_dashboard IS 
  'Dashboard metrics for settlement providers with RLS applied via current_merchant()';

-- ============================================
-- 5) Grant permissions
-- ============================================

-- Webhook events: only Edge Functions can write
GRANT SELECT, INSERT ON public.webhook_events TO authenticated;
GRANT SELECT, INSERT ON public.webhook_events TO service_role;

-- Settlement dashboard: merchants can read their own data
GRANT SELECT ON app.settlement_dashboard TO authenticated;
