// Circle Payout Edge Function
// Handles USDC off-ramp to USD bank transfers via Circle API

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { userClient } from "../_shared/supabase.ts";
import { json } from "../_shared/responses.ts";

const CIRCLE_API_KEY = Deno.env.get('CIRCLE_API_KEY');
const CIRCLE_BASE_URL = Deno.env.get('CIRCLE_BASE_URL') || 'https://api-sandbox.circle.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      return json({ error: 'Missing required fields' }, 400);
    }

    if (!CIRCLE_API_KEY) {
      return json({ error: 'Circle API key not configured' }, 500);
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

    console.log('💰 Creating Circle payout:', { invoiceRef, amount, currency });

    // Create payout on Circle
    const payoutResponse = await fetch(`${CIRCLE_BASE_URL}/v1/businessAccount/payouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CIRCLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotencyKey: invoiceRef,
        source: {
          type: 'wallet',
          id: Deno.env.get('CIRCLE_WALLET_ID') || 'default',
        },
        destination: {
          type: 'wire',
          id: recipientId,
        },
        amount: {
          amount: amount.toFixed(2),
          currency: currency.toUpperCase(),
        },
        metadata: {
          invoiceRef,
          merchantId: invoice.id,
        },
      }),
    });

    if (!payoutResponse.ok) {
      const error = await payoutResponse.json();
      console.error('❌ Circle API error:', error);
      return json({ 
        error: 'Circle payout failed', 
        details: error.message || payoutResponse.statusText 
      }, payoutResponse.status);
    }

    const payoutData = await payoutResponse.json();
    const payout = payoutData.data;

    console.log('✅ Circle payout created:', payout.id);

    // Mark settlement as requested in database
    await supabase
      .from('payments')
      .update({
        settlement_provider: 'circle',
        settlement_id: payout.id,
        settlement_currency: currency,
        settlement_amount: amount,
        settlement_requested_at: new Date().toISOString(),
      })
      .eq('invoice_id', invoice.id);

    return json({
      success: true,
      payoutId: payout.id,
      status: payout.status,
      amount: payout.amount.amount,
      currency: payout.amount.currency,
      estimatedArrival: payout.createDate,
      trackingUrl: `${CIRCLE_BASE_URL}/payouts/${payout.id}`,
    });

  } catch (error) {
    console.error('❌ Error in circle-payout:', error);
    return json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});
