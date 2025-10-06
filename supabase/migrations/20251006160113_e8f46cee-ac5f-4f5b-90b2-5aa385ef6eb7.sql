-- Update current_merchant() function to respect role-based access to sensitive fields
-- Owners get full access, members get filtered data

DROP FUNCTION IF EXISTS public.current_merchant();

-- Create two versions: one for owners, one for members
CREATE OR REPLACE FUNCTION public.current_merchant()
RETURNS TABLE(
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _user_id uuid;
  _merchant_id uuid;
  _is_owner boolean;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get the default merchant ID
  SELECT mm.merchant_id INTO _merchant_id
  FROM merchant_members mm
  WHERE mm.user_id = _user_id
    AND mm.is_default = true
    AND mm.status = 'active'
  LIMIT 1;
  
  IF _merchant_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if user is owner
  _is_owner := app.is_owner(_merchant_id);
  
  -- Return full data for owners, filtered data for regular members
  IF _is_owner THEN
    RETURN QUERY
    SELECT 
      m.id,
      m.name,
      m.logo_url,
      m.wallet_masked,
      m.category,
      m.email,
      m.phone,
      m.onboarding_complete,
      m.pix_settlement,
      m.pay_with_binance,
      m.use_program,
      m.demo_mode,
      m.created_at,
      m.updated_at
    FROM merchants m
    WHERE m.id = _merchant_id;
  ELSE
    -- Return data without sensitive fields for non-owners
    RETURN QUERY
    SELECT 
      m.id,
      m.name,
      m.logo_url,
      m.wallet_masked,
      m.category,
      NULL::text as email,
      NULL::text as phone,
      m.onboarding_complete,
      m.pix_settlement,
      m.pay_with_binance,
      m.use_program,
      m.demo_mode,
      m.created_at,
      m.updated_at
    FROM merchants m
    WHERE m.id = _merchant_id;
  END IF;
END;
$function$;

COMMENT ON FUNCTION public.current_merchant() IS 
'Returns the current users default merchant. Owners receive full data including email/phone. Regular members receive filtered data without sensitive contact information.';