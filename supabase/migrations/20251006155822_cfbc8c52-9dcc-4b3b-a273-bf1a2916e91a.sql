-- Security audit and hardening of app.is_member() and app.is_owner()
-- These functions are the foundation of all RLS policies

-- Drop existing functions to recreate with enhanced security
DROP FUNCTION IF EXISTS public.is_member(uuid);
DROP FUNCTION IF EXISTS public.is_owner(uuid);

-- Enhanced is_member function with explicit authentication checks
CREATE OR REPLACE FUNCTION public.is_member(_merchant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _user_id uuid;
BEGIN
  -- Explicit authentication check: get current user ID
  _user_id := auth.uid();
  
  -- Return FALSE immediately if user is not authenticated
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Return FALSE immediately if merchant_id is NULL (invalid input)
  IF _merchant_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if authenticated user is an active member of the merchant
  RETURN EXISTS (
    SELECT 1 
    FROM public.merchant_members
    WHERE merchant_id = _merchant_id 
      AND user_id = _user_id
      AND status = 'active'
  );
END;
$function$;

-- Enhanced is_owner function with explicit authentication checks
CREATE OR REPLACE FUNCTION public.is_owner(_merchant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _user_id uuid;
BEGIN
  -- Explicit authentication check: get current user ID
  _user_id := auth.uid();
  
  -- Return FALSE immediately if user is not authenticated
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Return FALSE immediately if merchant_id is NULL (invalid input)
  IF _merchant_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if authenticated user is an active owner of the merchant
  RETURN EXISTS (
    SELECT 1 
    FROM public.merchant_members
    WHERE merchant_id = _merchant_id 
      AND user_id = _user_id
      AND role = 'owner'
      AND status = 'active'
  );
END;
$function$;

-- Add security comments
COMMENT ON FUNCTION public.is_member(uuid) IS 
'Security-critical function: Validates if authenticated user is an active member of the specified merchant. Used by all RLS policies. Returns FALSE if user is not authenticated or merchant_id is NULL.';

COMMENT ON FUNCTION public.is_owner(uuid) IS 
'Security-critical function: Validates if authenticated user is an active owner of the specified merchant. Used by RLS policies requiring elevated permissions. Returns FALSE if user is not authenticated or merchant_id is NULL.';