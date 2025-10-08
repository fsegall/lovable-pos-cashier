// Wise Payout Edge Function
// Handles multi-currency off-ramp via Wise API (BRL, USD, EUR, GBP, 50+ currencies)

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { userClient } from "../_shared/supabase.ts";
import { json } from "../_shared/responses.ts";

const WISE_API_TOKEN = Deno.env.get('WISE_API_TOKEN');
const WISE_API_BASE = Deno.env.get('WISE_API_BASE') || 'https://api.sandbox.transferwise.tech';
const WISE_PROFILE_ID = Deno.env.get('WISE_PROFILE_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function authHeaders() {
  return {
    'Authorization': `Bearer ${WISE_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const { invoiceRef, amount, currency, recipientId } = await req.json();

    // Validate inputs
    if (!invoiceRef || !amount || !currency || !recipientId) {
      return json({ error: 'Missing required fields: invoiceRef, amount, currency, recipientId' }, 400);
    }

    if (!WISE_API_TOKEN || !WISE_PROFILE_ID) {
      return json({ error: 'Wise API credentials not configured' }, 500);
    }

    // Get user's merchant context
    const supabase = userClient(req);
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, ref, status, amount_brl')
      .eq('ref', invoiceRef)
      .single();

    if (!invoice) {
      return json({ error: 'Invoice not found' }, 404);
    }

    if (invoice.status !== 'confirmed') {
      return json({ error: 'Invoice must be confirmed before settlement' }, 400);
    }

    console.log('💱 Creating Wise payout:', { invoiceRef, amount, currency, recipientId });

    // Step 1: Create quote
    console.log('📊 Step 1: Creating quote...');
    const quoteResponse = await fetch(
      `${WISE_API_BASE}/v3/profiles/${WISE_PROFILE_ID}/quotes`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          sourceCurrency: currency,
          targetCurrency: currency,
          sourceAmount: amount,
          payOut: 'BANK_TRANSFER',
        }),
      }
    );

    if (!quoteResponse.ok) {
      const error = await quoteResponse.json();
      console.error('❌ Wise quote error:', error);
      return json({ 
        error: 'Wise quote failed', 
        details: error.errors?.[0]?.message || quoteResponse.statusText 
      }, quoteResponse.status);
    }

    const quote = await quoteResponse.json();
    console.log('✅ Quote created:', { id: quote.id, fee: quote.fee, rate: quote.rate });

    // Step 2: Create transfer
    console.log('💸 Step 2: Creating transfer...');
    const transferResponse = await fetch(
      `${WISE_API_BASE}/v1/transfers`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          targetAccount: parseInt(recipientId),
          quoteUuid: quote.id,
          customerTransactionId: invoiceRef,
          details: {
            reference: `Invoice ${invoiceRef}`,
          },
        }),
      }
    );

    if (!transferResponse.ok) {
      const error = await transferResponse.json();
      console.error('❌ Wise transfer error:', error);
      return json({ 
        error: 'Wise transfer failed', 
        details: error.errors?.[0]?.message || transferResponse.statusText 
      }, transferResponse.status);
    }

    const transfer = await transferResponse.json();
    console.log('✅ Transfer created:', transfer.id);

    // Step 3: Fund transfer from Wise balance
    console.log('💰 Step 3: Funding transfer...');
    const fundResponse = await fetch(
      `${WISE_API_BASE}/v3/profiles/${WISE_PROFILE_ID}/transfers/${transfer.id}/payments`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          type: 'BALANCE',
        }),
      }
    );

    if (!fundResponse.ok) {
      const error = await fundResponse.json();
      console.error('❌ Wise funding error:', error);
      return json({ 
        error: 'Wise funding failed', 
        details: error.errors?.[0]?.message || fundResponse.statusText 
      }, fundResponse.status);
    }

    const funding = await fundResponse.json();
    console.log('✅ Transfer funded:', funding.status);

    // Update payment in database
    await supabase
      .from('payments')
      .update({
        settlement_provider: 'wise',
        settlement_id: transfer.id.toString(),
        settlement_currency: currency,
        settlement_amount: transfer.targetValue,
        settlement_fee: quote.fee,
        settlement_requested_at: new Date().toISOString(),
      })
      .eq('invoice_id', invoice.id);

    return json({
      success: true,
      transferId: transfer.id,
      quoteId: quote.id,
      status: transfer.status,
      amount: transfer.targetValue,
      currency: transfer.targetCurrency,
      fee: quote.fee,
      trackingUrl: `${WISE_API_BASE}/transfers/${transfer.id}`,
    });

  } catch (error) {
    console.error('❌ Error in wise-payout:', error);
    return json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});
