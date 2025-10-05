// supabase/functions/settlement-webhook/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { adminClient } from "../_shared/supabase.ts";
import { json } from "../_shared/responses.ts";
import { hmacSha256Hex, constantTimeEqual } from "../_shared/crypto.ts";

serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const body = await req.text();
  const signature = req.headers.get('x-webhook-signature') || req.headers.get('X-Webhook-Signature');
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET');

  // Validar HMAC se secret estiver configurado
  if (webhookSecret && signature) {
    const expectedSig = await hmacSha256Hex(webhookSecret, body);
    if (!constantTimeEqual(signature, expectedSig)) {
      return json({ error: 'Invalid signature' }, 401);
    }
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { reference, paymentId, status } = payload;
  if (!reference) return json({ error: 'Missing reference' }, 400);

  const supabase = adminClient();

  try {
    // Verificar se invoice existe e está confirmed
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('ref', reference)
      .single();

    if (!invoice) return json({ error: 'Invoice not found' }, 404);
    if (invoice.status !== 'confirmed') {
      return json({ error: 'Invoice not confirmed' }, 400);
    }

    // Marcar como settled
    const { error } = await supabase.rpc('mark_settled', { 
      ref: reference,
      pix_payment_id: paymentId 
    });

    if (error) throw error;

    return json({ status: 'settled', reference });

  } catch (error) {
    console.error('Webhook error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
});
