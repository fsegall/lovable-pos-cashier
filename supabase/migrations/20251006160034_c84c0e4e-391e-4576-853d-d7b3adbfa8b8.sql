-- Restrict sensitive merchant contact information to owners only
-- This prevents competitors from harvesting email/phone data

-- First, drop the current merchants SELECT policy
DROP POLICY IF EXISTS "merchants_select" ON public.merchants;

-- Create new SELECT policy: Only owners can see ALL fields including email/phone
CREATE POLICY "merchants_select_owner"
ON public.merchants
FOR SELECT
USING (app.is_owner(id));

-- Create a security definer function that returns merchant data WITHOUT sensitive fields
-- This can be used by regular members (non-owners)
CREATE OR REPLACE FUNCTION public.get_merchant_info(_merchant_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  logo_url text,
  wallet_masked text,
  category text,
  onboarding_complete boolean,
  pix_settlement boolean,
  pay_with_binance boolean,
  use_program boolean,
  demo_mode boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  
  -- Verify user is authenticated
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Verify user is a member of the merchant
  IF NOT app.is_member(_merchant_id) THEN
    RAISE EXCEPTION 'User is not a member of this merchant';
  END IF;
  
  -- Return merchant data WITHOUT email and phone
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.logo_url,
    m.wallet_masked,
    m.category,
    m.onboarding_complete,
    m.pix_settlement,
    m.pay_with_binance,
    m.use_program,
    m.demo_mode,
    m.created_at,
    m.updated_at
  FROM merchants m
  WHERE m.id = _merchant_id;
END;
$function$;

COMMENT ON FUNCTION public.get_merchant_info(uuid) IS 
'Returns merchant information WITHOUT sensitive contact fields (email, phone). Used by regular members. Owners should query the merchants table directly for full access.';