// supabase/functions/validate-payment/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { adminClient } from "../_shared/supabase.ts";
import { json } from "../_shared/responses.ts";

// TODO: Uncomment when @solana/pay is available on Deno
// import { findTransactionSignature, validateTransfer } from "npm:@solana/pay@0.4.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Accept reference from query params OR body
  const searchParams = new URL(req.url).searchParams;
  let reference = searchParams.get('reference');
  
  if (!reference && req.method === 'POST') {
    try {
      const body = await req.json();
      reference = body.reference;
    } catch (e) {
      // Invalid JSON, ignore
    }
  }
  
  if (!reference) return json({ error: 'Missing reference' }, 400);

  const supabase = adminClient();
  const DEMO_MODE = Deno.env.get('DEMO_MODE') === 'true';

  try {
    // Buscar invoice por reference
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('ref', reference)
      .single();

    if (!invoice) return json({ error: 'Invoice not found' }, 404);
    if (invoice.status !== 'pending') return json({ status: invoice.status });

    // TODO: Implementar validação real com @solana/pay
    if (!DEMO_MODE) {
      /*
      const tx = await findTransactionSignature(
        reference,
        Deno.env.get('SOLANA_RPC_URL')!,
        { commitment: 'confirmed' }
      );
      
      if (!tx) return json({ status: 'pending' });

      const isValid = await validateTransfer(tx, {
        recipient: Deno.env.get('MERCHANT_RECIPIENT')!,
        amount: invoice.amount_brl * 1000000, // BRZ has 6 decimals
        splToken: Deno.env.get('BRZ_MINT')!,
        reference: new PublicKey(reference)
      });

      if (!isValid) return json({ error: 'Invalid transfer' }, 400);
      */

      // Por enquanto, simular validação
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Marcar como confirmado
    const { error } = await supabase.rpc('mark_confirmed', { 
      ref: reference, 
      tx_hash: DEMO_MODE ? `DEMO_${Date.now()}` : 'VALIDATED_TX_HASH' 
    });

    if (error) throw error;

    return json({ 
      status: 'confirmed', 
      tx: DEMO_MODE ? `DEMO_${Date.now()}` : 'VALIDATED_TX_HASH' 
    });

  } catch (error) {
    console.error('Validation error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
});
