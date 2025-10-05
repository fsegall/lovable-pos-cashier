// supabase/functions/_shared/supabase.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

const URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

export function adminClient() {
  return createClient(URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

export function userClient(req: Request) {
  // Pass-through do JWT do usuário: mantém RLS aplicada
  const auth = req.headers.get('Authorization') ?? '';
  return createClient(URL, ANON, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
}
