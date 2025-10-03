-- Move todas as funções do schema app para public

-- 1. Função is_member
CREATE OR REPLACE FUNCTION public.is_member(_merchant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM merchant_members
    WHERE merchant_id = _merchant_id 
      AND user_id = auth.uid()
      AND status = 'active'
  );
END;
$$;

-- 2. Função is_owner
CREATE OR REPLACE FUNCTION public.is_owner(_merchant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM merchant_members
    WHERE merchant_id = _merchant_id 
      AND user_id = auth.uid()
      AND role = 'owner'
      AND status = 'active'
  );
END;
$$;

-- 3. Função current_merchant
CREATE OR REPLACE FUNCTION public.current_merchant()
RETURNS TABLE (
  id uuid,
  name text,
  logo_url text,
  wallet_masked text,
  category text,
  email text,
  phone text,
  onboarding_complete boolean,
  pix_settlement boolean,
  pay_with_binance boolean,
  use_program boolean,
  demo_mode boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT m.*
  FROM merchants m
  JOIN merchant_members mm ON mm.merchant_id = m.id
  WHERE mm.user_id = auth.uid()
    AND mm.is_default = true
    AND mm.status = 'active'
  LIMIT 1;
END;
$$;

-- 4. Função list_receipts
CREATE OR REPLACE FUNCTION public.list_receipts(_from timestamptz, _to timestamptz)
RETURNS TABLE (
  id uuid,
  ref text,
  amount_brl numeric,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  payment_id uuid,
  payment_status text,
  tx_hash text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _merchant_id uuid;
BEGIN
  -- Pega o merchant_id do usuário
  SELECT mm.merchant_id INTO _merchant_id
  FROM merchant_members mm
  WHERE mm.user_id = auth.uid()
    AND mm.is_default = true
    AND mm.status = 'active'
  LIMIT 1;

  IF _merchant_id IS NULL THEN
    RAISE EXCEPTION 'No default merchant found';
  END IF;

  RETURN QUERY
  SELECT 
    i.id,
    i.ref,
    i.amount_brl,
    i.status,
    i.created_at,
    i.updated_at,
    p.id as payment_id,
    p.status as payment_status,
    p.tx_hash
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id
  WHERE i.merchant_id = _merchant_id
    AND i.created_at BETWEEN _from AND _to
  ORDER BY i.created_at DESC;
END;
$$;

-- 5. Função create_invoice_with_payment
CREATE OR REPLACE FUNCTION public.create_invoice_with_payment(
  _amount_brl numeric,
  _product_ids uuid[],
  _ref text
)
RETURNS TABLE (
  invoice_id uuid,
  payment_id uuid,
  ref text,
  amount_brl numeric,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _merchant_id uuid;
  _invoice_id uuid;
  _payment_id uuid;
BEGIN
  -- Pega o merchant_id do usuário
  SELECT mm.merchant_id INTO _merchant_id
  FROM merchant_members mm
  WHERE mm.user_id = auth.uid()
    AND mm.is_default = true
    AND mm.status = 'active'
  LIMIT 1;

  IF _merchant_id IS NULL THEN
    RAISE EXCEPTION 'No default merchant found';
  END IF;

  -- Cria a invoice
  INSERT INTO invoices (merchant_id, amount_brl, product_ids, ref, status)
  VALUES (_merchant_id, _amount_brl, _product_ids, _ref, 'pending')
  RETURNING id INTO _invoice_id;

  -- Cria o payment
  INSERT INTO payments (invoice_id, amount_brl, status)
  VALUES (_invoice_id, _amount_brl, 'pending')
  RETURNING id INTO _payment_id;

  RETURN QUERY
  SELECT _invoice_id, _payment_id, _ref, _amount_brl, 'pending'::text;
END;
$$;

-- 6. Função update_payment_status
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
  -- Busca a invoice pelo ref
  SELECT id INTO _invoice_id
  FROM invoices
  WHERE ref = _ref;

  IF _invoice_id IS NULL THEN
    RAISE EXCEPTION 'Invoice not found with ref: %', _ref;
  END IF;

  -- Atualiza o payment
  UPDATE payments
  SET status = _status,
      tx_hash = COALESCE(_tx_hash, tx_hash),
      updated_at = now()
  WHERE invoice_id = _invoice_id;

  -- Atualiza a invoice
  UPDATE invoices
  SET status = _status,
      updated_at = now()
  WHERE id = _invoice_id;
END;
$$;

-- 7. Função mark_confirmed
CREATE OR REPLACE FUNCTION public.mark_confirmed(_ref text, _tx_hash text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.update_payment_status(_ref, 'confirmed', _tx_hash);
END;
$$;

-- 8. Função mark_settled
CREATE OR REPLACE FUNCTION public.mark_settled(_ref text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.update_payment_status(_ref, 'settled', NULL);
END;
$$;

-- 9. Função set_default_merchant
CREATE OR REPLACE FUNCTION public.set_default_merchant(_merchant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove o default de todos os merchants do usuário
  UPDATE merchant_members
  SET is_default = false
  WHERE user_id = auth.uid();

  -- Define o novo merchant como default
  UPDATE merchant_members
  SET is_default = true
  WHERE merchant_id = _merchant_id
    AND user_id = auth.uid()
    AND status = 'active';
END;
$$;