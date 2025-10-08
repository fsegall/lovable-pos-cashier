-- Update create_invoice_with_payment to accept Solana reference (PublicKey)
-- This allows on-chain validation to work properly

-- Drop existing function
DROP FUNCTION IF EXISTS app.create_invoice_with_payment(numeric, text, uuid[]);

-- Recreate with reference parameter
CREATE OR REPLACE FUNCTION app.create_invoice_with_payment(
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
  -- Get current merchant
  _merchant_id := app.current_merchant();
  IF _merchant_id IS NULL THEN 
    RAISE EXCEPTION 'No default merchant set for user'; 
  END IF;

  -- Create invoice with optional Solana reference
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
  
  -- Create pending payment
  INSERT INTO public.payments (invoice_id, amount_brl, status)
  VALUES (_invoice_id, _amount_brl, 'pending');
  
  RETURN _invoice_id;
END;
$$;

COMMENT ON FUNCTION app.create_invoice_with_payment IS 
  'Create invoice with payment. Optionally accepts Solana Pay reference (PublicKey) for on-chain validation.';
