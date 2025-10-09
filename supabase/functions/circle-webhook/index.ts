// Circle Webhook Handler
// Processes webhook events from Circle for payout status updates

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { adminClient } from "../_shared/supabase.ts";
import { json } from "../_shared/responses.ts";
import { hmacSha256Hex, constantTimeEqual } from "../_shared/crypto.ts";

const CIRCLE_WEBHOOK_SECRET = Deno.env.get('CIRCLE_WEBHOOK_SECRET');

serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const startTime = Date.now();

  try {
    const payload = await req.text();
    const signature = req.headers.get('X-Circle-Signature') || '';

    console.log('📥 Circle webhook received:', {
      hasSignature: !!signature,
      payloadLength: payload.length,
    });

    // Validate HMAC signature
    if (CIRCLE_WEBHOOK_SECRET) {
      const expectedSignature = await hmacSha256Hex(CIRCLE_WEBHOOK_SECRET, payload);
      
      if (!signature || !constantTimeEqual(expectedSignature, signature)) {
        console.error('❌ Invalid Circle webhook signature');
        return json({ error: 'Invalid signature' }, 401);
      }
    } else {
      console.warn('⚠️ CIRCLE_WEBHOOK_SECRET not set - skipping signature validation');
    }

    const event = JSON.parse(payload);
    const supabase = adminClient();

    console.log('🔍 Processing Circle event:', {
      type: event.Type,
      action: event.Action,
      payoutId: event.payout?.id,
    });

    // Log webhook event for audit
    const { error: logError } = await supabase
      .from('webhook_events')
      .insert({
        provider: 'circle',
        event_type: `${event.Type}.${event.Action}`,
        payload: event,
        signature,
        processed: false,
      });

    if (logError) {
      console.error('⚠️ Failed to log webhook event:', logError);
    }

    // Process payout events
    if (event.Type === 'payout') {
      const payout = event.payout;
      const invoiceRef = payout.metadata?.invoiceRef;

      if (!invoiceRef) {
        console.warn('⚠️ No invoiceRef in payout metadata');
        return json({ ok: true, message: 'No invoiceRef to process' });
      }

      // Update settlement status based on payout status
      if (event.Action === 'completed' || payout.status === 'complete') {
        console.log('✅ Completing settlement:', invoiceRef);

        const { data: settlementId, error: settleError } = await supabase.rpc('mark_settled', {
          _ref: invoiceRef,
          _provider: 'circle',
          _provider_tx_id: payout.id,
          _currency: payout.amount.currency,
          _amount: parseFloat(payout.amount.amount),
          _fee: payout.fees?.amount ? parseFloat(payout.fees.amount) : null,
        });

        if (settleError) {
          console.error('❌ Failed to mark as settled:', settleError);
          throw settleError;
        }

        // Update webhook as processed and link to settlement
        await supabase
          .from('webhook_events')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            processing_time_ms: Date.now() - startTime,
            settlement_id: settlementId,
          })
          .eq('provider', 'circle')
          .eq('payload->payout->>id', payout.id)
          .is('processed', false);

        console.log('✅ Settlement completed:', { invoiceRef, payoutId: payout.id, settlementId });
      } else if (event.Action === 'failed' || payout.status === 'failed') {
        console.error('❌ Circle payout failed:', payout);

        // Update webhook event with error
        await supabase
          .from('webhook_events')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            processing_time_ms: Date.now() - startTime,
            error_message: payout.errorCode || 'Payout failed',
          })
          .eq('provider', 'circle')
          .eq('payload->payout->>id', payout.id)
          .is('processed', false);
      }
    }

    return json({ ok: true });

  } catch (error) {
    console.error('❌ Error processing Circle webhook:', error);
    
    // Try to log the error
    try {
      const supabase = adminClient();
      await supabase
        .from('webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          processing_time_ms: Date.now() - startTime,
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq('provider', 'circle')
        .is('processed', false)
        .order('created_at', { ascending: false })
        .limit(1);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return json({ 
      error: 'Webhook processing failed', 
      message: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});
