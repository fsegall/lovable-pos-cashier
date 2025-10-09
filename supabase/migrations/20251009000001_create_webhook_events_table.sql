-- Create webhook_events table for audit trail
-- This table logs all webhook events from settlement providers for debugging and compliance

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,                       -- Provider name (circle, wise, mercadopago, etc.)
  event_type text NOT NULL,                     -- Event type from provider
  payload jsonb NOT NULL,                       -- Full webhook payload
  signature text,                               -- Webhook signature for validation
  processed boolean NOT NULL DEFAULT false,     -- Whether event was successfully processed
  processed_at timestamptz,                     -- When event was processed
  processing_time_ms integer,                   -- Time taken to process (for monitoring)
  error_message text,                           -- Error details if processing failed
  settlement_id uuid REFERENCES public.settlements(id) ON DELETE SET NULL,  -- Link to settlement if applicable
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON public.webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_settlement ON public.webhook_events(settlement_id) WHERE settlement_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON public.webhook_events(created_at DESC);

-- Composite index for lookups by provider and event type
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_type_created 
  ON public.webhook_events(provider, event_type, created_at DESC);

-- Enable RLS (webhook events should only be accessible by service role, but we enable RLS for safety)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only owners of related merchant can view webhook events
CREATE POLICY "webhook_events_select" ON public.webhook_events
  FOR SELECT USING (
    CASE 
      WHEN settlement_id IS NOT NULL THEN
        app.is_owner((
          SELECT i.merchant_id 
          FROM public.settlements s
          JOIN public.payments p ON p.id = s.payment_id
          JOIN public.invoices i ON i.id = p.invoice_id
          WHERE s.id = webhook_events.settlement_id
        ))
      ELSE
        false  -- If no settlement linked, only service role can see
    END
  );

-- Policy: Only service role can insert (webhooks come from external providers)
-- No INSERT policy means only service_role can insert

-- Add comments
COMMENT ON TABLE public.webhook_events IS 'Audit log of all webhook events from settlement providers';
COMMENT ON COLUMN public.webhook_events.provider IS 'Settlement provider that sent the webhook';
COMMENT ON COLUMN public.webhook_events.event_type IS 'Type of event (e.g., payout.completed, transfer.state-change)';
COMMENT ON COLUMN public.webhook_events.payload IS 'Complete webhook payload for debugging';
COMMENT ON COLUMN public.webhook_events.signature IS 'HMAC signature from provider for validation';
COMMENT ON COLUMN public.webhook_events.processed IS 'Whether the event was successfully processed';
COMMENT ON COLUMN public.webhook_events.processing_time_ms IS 'Processing time in milliseconds for performance monitoring';

