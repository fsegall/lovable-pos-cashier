-- Update mark_settled function to work with settlements table
-- This function now creates a settlement record instead of updating payment columns

DROP FUNCTION IF EXISTS public.mark_settled(text, text, text, text, numeric, numeric);

CREATE OR REPLACE FUNCTION public.mark_settled(
  _ref text,
  _provider text DEFAULT 'none',
  _provider_tx_id text DEFAULT NULL,
  _currency text DEFAULT NULL,
  _amount numeric DEFAULT NULL,
  _fee numeric DEFAULT NULL
)
RETURNS uuid  -- Returns settlement_id
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invoice_id uuid;
  _payment_id uuid;
  _settlement_id uuid;
  _payment_amount numeric;
BEGIN
  -- Find invoice by ref
  SELECT id INTO _invoice_id
  FROM public.invoices
  WHERE ref = _ref;

  IF _invoice_id IS NULL THEN
    RAISE EXCEPTION 'Invoice not found: %', _ref;
  END IF;

  -- Find payment
  SELECT id, amount_brl INTO _payment_id, _payment_amount
  FROM public.payments
  WHERE invoice_id = _invoice_id
  LIMIT 1;

  IF _payment_id IS NULL THEN
    RAISE EXCEPTION 'Payment not found for invoice: %', _ref;
  END IF;

  -- Create settlement record
  INSERT INTO public.settlements (
    payment_id,
    provider,
    provider_tx_id,
    currency,
    amount,
    fee,
    status,
    completed_at
  )
  VALUES (
    _payment_id,
    _provider,
    _provider_tx_id,
    COALESCE(_currency, 'BRL'),
    COALESCE(_amount, _payment_amount),
    COALESCE(_fee, 0),
    'completed',
    NOW()
  )
  RETURNING id INTO _settlement_id;

  -- Update invoice status to settled
  UPDATE public.invoices
  SET 
    status = 'settled',
    updated_at = NOW()
  WHERE id = _invoice_id;

  -- Update payment status and settled_at timestamp
  UPDATE public.payments
  SET 
    status = 'settled',
    settled_at = NOW(),
    updated_at = NOW()
  WHERE id = _payment_id;

  RETURN _settlement_id;
END;
$$;

COMMENT ON FUNCTION public.mark_settled IS 'Marks payment as settled by creating a settlement record. Returns settlement ID.';

