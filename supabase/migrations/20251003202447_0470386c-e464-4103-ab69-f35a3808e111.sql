-- Função para criar merchant automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_merchant_id uuid;
BEGIN
  -- Cria um merchant para o novo usuário
  INSERT INTO merchants (
    name,
    wallet_masked,
    onboarding_complete,
    demo_mode
  )
  VALUES (
    'My Store',
    'USDC****',
    false,
    true
  )
  RETURNING id INTO new_merchant_id;

  -- Adiciona o usuário como owner do merchant
  INSERT INTO merchant_members (
    merchant_id,
    user_id,
    email,
    role,
    status,
    is_default
  )
  VALUES (
    new_merchant_id,
    NEW.id,
    NEW.email,
    'owner',
    'active',
    true
  );

  RETURN NEW;
END;
$$;

-- Trigger para criar merchant após signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();