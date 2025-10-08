// supabase/functions/validate-payment/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { adminClient } from "../_shared/supabase.ts";
import { json } from "../_shared/responses.ts";
// @ts-ignore - Deno npm imports not recognized by TypeScript
import { Connection, PublicKey } from "npm:@solana/web3.js@1.95.3";

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
      console.log('📥 Received POST body:', body);
      reference = body.reference;
    } catch (e) {
      console.error('❌ Failed to parse JSON body:', e);
    }
  }
  
  console.log('🔍 Looking for invoice with reference:', reference);
  if (!reference) return json({ error: 'Missing reference' }, 400);

  // Debug: check available env vars
  console.log('🔧 Environment check:', {
    hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
    hasServiceRole: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    hasAnon: !!Deno.env.get('SUPABASE_ANON_KEY'),
    demoMode: Deno.env.get('DEMO_MODE'),
  });

  const supabase = adminClient();
  const DEMO_MODE = Deno.env.get('DEMO_MODE') === 'true';

  try {
    // Buscar invoice por reference
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('ref', reference)
      .single();

    console.log('📋 Invoice query result:', { invoice, error: invoiceError });

    if (!invoice) {
      console.log('❌ Invoice not found for reference:', reference);
      return json({ error: 'Invoice not found', reference }, 404);
    }
    if (invoice.status !== 'pending') {
      console.log('✅ Invoice already processed:', invoice.status);
      return json({ status: invoice.status });
    }

    // Validação on-chain real
    if (!DEMO_MODE) {
      const SOLANA_RPC_URL = Deno.env.get('SOLANA_RPC_URL') || 'https://api.devnet.solana.com';
      const MERCHANT_RECIPIENT = Deno.env.get('MERCHANT_RECIPIENT');
      const BRZ_MINT = Deno.env.get('BRZ_MINT');

      if (!MERCHANT_RECIPIENT) {
        console.error('❌ MERCHANT_RECIPIENT not configured');
        return json({ error: 'Merchant recipient not configured' }, 500);
      }

      console.log('🔍 Validating on-chain transaction...', {
        reference,
        rpcUrl: SOLANA_RPC_URL,
        merchant: MERCHANT_RECIPIENT,
      });

      try {
        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        
        // Use invoice.reference (PublicKey) if available, otherwise can't validate
        const solanaReference = invoice.reference;
        if (!solanaReference) {
          console.warn('⚠️ Invoice has no Solana reference (PublicKey) - cannot validate on-chain');
          console.log('ℹ️ This invoice was created before Solana Pay integration');
          // Return pending to allow manual confirmation
          return json({ status: 'pending', message: 'No Solana reference available' });
        }

        console.log('🔍 Searching for transaction with reference:', solanaReference);
        
        const referencePubkey = new PublicKey(solanaReference);
        const merchantPubkey = new PublicKey(MERCHANT_RECIPIENT);
        
        // Get recent signatures for the reference account
        // This is a simplified approach - in production, use @solana/pay's findReference
        const signatures = await connection.getSignaturesForAddress(
          referencePubkey,
          { limit: 10 },
          'confirmed'
        );

        console.log(`📝 Found ${signatures.length} signatures for reference`);

        if (signatures.length === 0) {
          // No transaction found yet
          return json({ status: 'pending', message: 'Transaction not found yet' });
        }

        // Get the most recent transaction
        const txSignature = signatures[0].signature;
        console.log('🔍 Checking transaction:', txSignature);

        const tx = await connection.getTransaction(txSignature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        });

        if (!tx) {
          return json({ status: 'pending', message: 'Transaction not confirmed yet' });
        }

        // Basic validation: check if transaction succeeded
        if (tx.meta?.err) {
          console.error('❌ Transaction failed:', tx.meta.err);
          return json({ status: 'error', message: 'Transaction failed on-chain' }, 400);
        }

        console.log('✅ Transaction found and confirmed!', {
          signature: txSignature,
          slot: tx.slot,
          blockTime: tx.blockTime,
        });

        // TODO: Advanced validation
        // - Check recipient matches merchant wallet
        // - Check amount matches invoice
        // - Check token mint if SPL token
        // - Verify reference is in transaction
        
        // For now, if transaction exists and succeeded, we accept it
        console.log('✅ Marking as confirmed with real tx hash');
        
        // Marcar como confirmado com tx hash real
        const { error: confirmError } = await supabase.rpc('mark_confirmed', { 
          _ref: reference, 
          _tx_hash: txSignature 
        });

        if (confirmError) throw confirmError;

        return json({ 
          status: 'confirmed', 
          tx: txSignature,
          slot: tx.slot,
        });
        
      } catch (error) {
        console.error('❌ On-chain validation error:', error);
        // If validation fails, return pending (not error)
        // This allows retry on next poll
        return json({ status: 'pending', message: 'Validation error, will retry' });
      }
    }

    // DEMO_MODE: Marcar como confirmado automaticamente
    const { error } = await supabase.rpc('mark_confirmed', { 
      _ref: reference, 
      _tx_hash: `DEMO_${Date.now()}` 
    });

    if (error) throw error;

    return json({ 
      status: 'confirmed', 
      tx: `DEMO_${Date.now()}`,
      demo: true,
    });

  } catch (error) {
    console.error('Validation error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
});
