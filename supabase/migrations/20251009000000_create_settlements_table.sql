-- Create settlements table for off-ramp tracking
-- This table tracks fiat settlements from crypto payments via Circle, Wise, etc.

-- 1. Create settlements table
CREATE TABLE IF NOT EXISTS public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('circle', 'wise', 'mercadopago', 'transfero', 'none')),
  provider_tx_id text,                          -- External provider transaction ID
  currency text NOT NULL,                        -- Settlement currency (USD, BRL, EUR, etc.)
  amount numeric(12,2) NOT NULL,                -- Settlement amount in target currency
  fee numeric(12,2) DEFAULT 0,                  -- Provider fee
  exchange_rate numeric(20,8),                  -- Exchange rate if different from payment currency
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  recipient_id text,                            -- Provider recipient/account ID
  metadata jsonb DEFAULT '{}'::jsonb,           -- Additional provider-specific data
  error_message text,                           -- Error details if failed
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Add timestamp columns to payments for quick status checks
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS settled_at timestamptz;

-- 3. Create indexes for settlements
CREATE INDEX IF NOT EXISTS idx_settlements_payment ON public.settlements(payment_id);
CREATE INDEX IF NOT EXISTS idx_settlements_provider ON public.settlements(provider);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON public.settlements(status);
CREATE INDEX IF NOT EXISTS idx_settlements_provider_tx ON public.settlements(provider_tx_id) WHERE provider_tx_id IS NOT NULL;

-- 4. Enable RLS on settlements
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for settlements (same as payments - check merchant membership)
CREATE POLICY "settlements_select" ON public.settlements
  FOR SELECT USING (
    app.is_member((
      SELECT i.merchant_id 
      FROM public.payments p
      JOIN public.invoices i ON i.id = p.invoice_id
      WHERE p.id = settlements.payment_id
    ))
  );

CREATE POLICY "settlements_insert" ON public.settlements
  FOR INSERT WITH CHECK (
    app.is_member((
      SELECT i.merchant_id 
      FROM public.payments p
      JOIN public.invoices i ON i.id = p.invoice_id
      WHERE p.id = settlements.payment_id
    ))
  );

CREATE POLICY "settlements_update" ON public.settlements
  FOR UPDATE USING (
    app.is_member((
      SELECT i.merchant_id 
      FROM public.payments p
      JOIN public.invoices i ON i.id = p.invoice_id
      WHERE p.id = settlements.payment_id
    ))
  );

-- 6. Create trigger for updated_at
CREATE TRIGGER update_settlements_updated_at 
  BEFORE UPDATE ON public.settlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE settlements;

-- 8. Add comments
COMMENT ON TABLE public.settlements IS 'Tracks fiat settlements from crypto payments via settlement providers (Circle, Wise, etc)';
COMMENT ON COLUMN public.settlements.provider IS 'Settlement provider: circle, wise, mercadopago, transfero, or none';
COMMENT ON COLUMN public.settlements.provider_tx_id IS 'External provider transaction/transfer ID for tracking';
COMMENT ON COLUMN public.settlements.amount IS 'Settlement amount in target fiat currency';
COMMENT ON COLUMN public.settlements.fee IS 'Provider fee charged for the settlement';
COMMENT ON COLUMN public.settlements.exchange_rate IS 'Exchange rate applied if converting between currencies';

