-- Move all app schema functions to public schema
-- This simplifies API access and avoids schema exposure issues

-- 1. Drop existing functions from both schemas
DROP FUNCTION IF EXISTS app.current_merchant();
DROP FUNCTION IF EXISTS app.set_default_merchant(uuid);
DROP FUNCTION IF EXISTS app.list_receipts(timestamptz, timestamptz);
DROP FUNCTION IF EXISTS app.create_invoice_with_payment(numeric, text, uuid[], text);
DROP FUNCTION IF EXISTS app.update_payment_status(text, text, text);
DROP FUNCTION IF EXISTS app.mark_confirmed(text, text);
DROP FUNCTION IF EXISTS app.mark_settled(text, text, text, text, numeric, numeric);

-- Drop public schema functions (may have different signatures)
DROP FUNCTION IF EXISTS public.current_merchant();
DROP FUNCTION IF EXISTS public.set_default_merchant(uuid);
DROP FUNCTION IF EXISTS public.list_receipts(timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.create_invoice_with_payment(numeric, uuid[], text); -- old signature
DROP FUNCTION IF EXISTS public.create_invoice_with_payment(numeric, text, uuid[]); -- another old signature
DROP FUNCTION IF EXISTS public.create_invoice_with_payment(numeric, text, uuid[], text); -- new signature
DROP FUNCTION IF EXISTS public.update_payment_status(text, text, text);
DROP FUNCTION IF EXISTS public.mark_confirmed(text, text);
DROP FUNCTION IF EXISTS public.mark_settled(text);
DROP FUNCTION IF EXISTS public.mark_settled(text, text, text, text, numeric, numeric);

-- 2. Recreate in public schema

-- current_merchant: returns default merchant for current user
CREATE OR REPLACE FUNCTION public.current_merchant()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT merchant_id 
  FROM public.merchant_members 
  WHERE user_id = auth.uid() 
    AND is_default = true 
    AND status = 'active'
  LIMIT 1;
$$;

-- set_default_merchant: sets default merchant for current user
CREATE OR REPLACE FUNCTION public.set_default_merchant(_merchant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear existing default
  UPDATE public.merchant_members
  SET is_default = false
  WHERE user_id = auth.uid();
  
  -- Set new default
  UPDATE public.merchant_members
  SET is_default = true
  WHERE user_id = auth.uid() 
    AND merchant_id = _merchant_id;
END;
$$;

-- list_receipts: lists receipts for current merchant
CREATE OR REPLACE FUNCTION public.list_receipts(
  _from timestamptz,
  _to timestamptz
)
RETURNS TABLE (
  id uuid,
  ref text,
  amount_brl numeric,
  status text,
  created_at timestamptz,
  tx_hash text,
  product_ids uuid[],
  payment_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _merchant_id uuid;
BEGIN
  _merchant_id := public.current_merchant();
  IF _merchant_id IS NULL THEN
    RAISE EXCEPTION 'No default merchant set for user';
  END IF;

  RETURN QUERY
  SELECT 
    i.id,
    i.ref,
    i.amount_brl,
    i.status,
    i.created_at,
    p.tx_hash,
    i.product_ids,
    p.id as payment_id
  FROM public.invoices i
  LEFT JOIN public.payments p ON p.invoice_id = i.id
  WHERE i.merchant_id = _merchant_id
    AND i.created_at >= _from
    AND i.created_at <= _to
  ORDER BY i.created_at DESC;
END;
$$;

-- create_invoice_with_payment: creates invoice + payment with optional Solana reference
CREATE OR REPLACE FUNCTION public.create_invoice_with_payment(
  _amount_brl numeric,
  _ref text,
  _product_ids uuid[] DEFAULT '{}',
  _reference text DEFAULT NULL
)
RETURNS uuid 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  _merchant_id uuid;
  _invoice_id uuid;
BEGIN
  _merchant_id := public.current_merchant();
  IF _merchant_id IS NULL THEN 
    RAISE EXCEPTION 'No default merchant set for user'; 
  END IF;

  INSERT INTO public.invoices (
    merchant_id, 
    amount_brl, 
    ref, 
    reference,
    status, 
    product_ids
  )
  VALUES (
    _merchant_id, 
    _amount_brl, 
    _ref, 
    _reference,
    'pending', 
    _product_ids
  )
  RETURNING id INTO _invoice_id;
  
  INSERT INTO public.payments (invoice_id, amount_brl, status)
  VALUES (_invoice_id, _amount_brl, 'pending');
  
  RETURN _invoice_id;
END;
$$;

-- update_payment_status: updates payment and invoice status
CREATE OR REPLACE FUNCTION public.update_payment_status(
  _ref text,
  _status text,
  _tx_hash text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invoice_id uuid;
BEGIN
  SELECT id INTO _invoice_id
  FROM public.invoices
  WHERE ref = _ref;

  IF _invoice_id IS NULL THEN
    RAISE EXCEPTION 'Invoice not found: %', _ref;
  END IF;

  UPDATE public.invoices
  SET status = _status
  WHERE id = _invoice_id;

  UPDATE public.payments
  SET 
    status = _status,
    tx_hash = COALESCE(_tx_hash, tx_hash),
    confirmed_at = CASE WHEN _status = 'confirmed' THEN NOW() ELSE confirmed_at END
  WHERE invoice_id = _invoice_id;
END;
$$;

-- mark_confirmed: marks invoice as confirmed with tx hash
CREATE OR REPLACE FUNCTION public.mark_confirmed(
  _ref text,
  _tx_hash text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.update_payment_status(_ref, 'confirmed', _tx_hash);
END;
$$;

-- mark_settled: marks payment as settled with settlement details
CREATE OR REPLACE FUNCTION public.mark_settled(
  _ref text,
  _settlement_provider text DEFAULT NULL,
  _settlement_tx_id text DEFAULT NULL,
  _settlement_currency text DEFAULT NULL,
  _settlement_amount numeric DEFAULT NULL,
  _settlement_fee numeric DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invoice_id uuid;
BEGIN
  SELECT id INTO _invoice_id
  FROM public.invoices
  WHERE ref = _ref;

  IF _invoice_id IS NULL THEN
    RAISE EXCEPTION 'Invoice not found: %', _ref;
  END IF;

  UPDATE public.invoices
  SET status = 'settled'
  WHERE id = _invoice_id;

  UPDATE public.payments
  SET 
    status = 'settled',
    settled_at = NOW(),
    settlement_provider = COALESCE(_settlement_provider, settlement_provider),
    settlement_tx_id = COALESCE(_settlement_tx_id, settlement_tx_id),
    settlement_currency = COALESCE(_settlement_currency, settlement_currency),
    settlement_amount = COALESCE(_settlement_amount, settlement_amount),
    settlement_fee = COALESCE(_settlement_fee, settlement_fee)
  WHERE invoice_id = _invoice_id;
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.current_merchant IS 'Returns default merchant for current user';
COMMENT ON FUNCTION public.set_default_merchant IS 'Sets default merchant for current user';
COMMENT ON FUNCTION public.list_receipts IS 'Lists receipts for current merchant in date range';
COMMENT ON FUNCTION public.create_invoice_with_payment IS 'Creates invoice with payment. Optionally accepts Solana Pay reference (PublicKey) for on-chain validation.';
COMMENT ON FUNCTION public.update_payment_status IS 'Updates payment and invoice status';
COMMENT ON FUNCTION public.mark_confirmed IS 'Marks invoice as confirmed with tx hash';
COMMENT ON FUNCTION public.mark_settled IS 'Marks payment as settled with settlement details';
