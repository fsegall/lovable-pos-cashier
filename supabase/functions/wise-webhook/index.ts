// Wise Webhook Handler
// Processes webhook events from Wise for transfer status updates

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { adminClient } from "../_shared/supabase.ts";
import { json } from "../_shared/responses.ts";
import { hmacSha256Hex, constantTimeEqual } from "../_shared/crypto.ts";

const WISE_WEBHOOK_SECRET = Deno.env.get('WISE_WEBHOOK_SECRET');

serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const startTime = Date.now();

  try {
    const payload = await req.text();
    const signature = req.headers.get('X-Signature') || req.headers.get('X-Signature-SHA256') || '';

    console.log('📥 Wise webhook received:', {
      hasSignature: !!signature,
      payloadLength: payload.length,
    });

    // Validate HMAC signature
    if (WISE_WEBHOOK_SECRET) {
      const expectedSignature = await hmacSha256Hex(WISE_WEBHOOK_SECRET, payload);
      
      if (!signature || !constantTimeEqual(expectedSignature, signature)) {
        console.error('❌ Invalid Wise webhook signature');
        return json({ error: 'Invalid signature' }, 401);
      }
    } else {
      console.warn('⚠️ WISE_WEBHOOK_SECRET not set - skipping signature validation');
    }

    const event = JSON.parse(payload);
    const supabase = adminClient();

    console.log('🔍 Processing Wise event:', {
      eventType: event.event_type,
      currentState: event.data?.current_state,
      transferId: event.data?.resource?.id,
    });

    // Log webhook event for audit
    const { error: logError } = await supabase
      .from('webhook_events')
      .insert({
        provider: 'wise',
        event_type: event.event_type,
        payload: event,
        signature,
        processed: false,
      });

    if (logError) {
      console.error('⚠️ Failed to log webhook event:', logError);
    }

    // Process transfer state changes
    if (event.event_type === 'transfers#state-change') {
      const transfer = event.data.resource;
      const currentState = event.data.current_state;
      const transferId = transfer.id;

      console.log('💱 Transfer state change:', {
        transferId,
        previousState: event.data.previous_state,
        currentState,
      });

      // Find payment by settlement_id
      const { data: payment } = await supabase
        .from('payments')
        .select('id, invoice_id, settlement_id')
        .eq('settlement_provider', 'wise')
        .eq('settlement_id', transferId.toString())
        .single();

      if (!payment) {
        console.warn('⚠️ No payment found for transfer:', transferId);
        return json({ ok: true, message: 'Transfer not tracked' });
      }

      // Get invoice ref
      const { data: invoice } = await supabase
        .from('invoices')
        .select('ref')
        .eq('id', payment.invoice_id)
        .single();

      if (!invoice) {
        console.error('❌ Invoice not found for payment:', payment.id);
        return json({ error: 'Invoice not found' }, 404);
      }

      // Update based on state
      if (currentState === 'outgoing_payment_sent') {
        console.log('✅ Marking payment as settled:', invoice.ref);

        const { error: settleError } = await supabase.rpc('mark_settled', {
          _ref: invoice.ref,
          _provider: 'wise',
          _settlement_id: transferId.toString(),
          _currency: transfer.sourceCurrency,
          _amount: transfer.targetValue,
          _fee: null, // Fee was already in the quote
        });

        if (settleError) {
          console.error('❌ Failed to mark as settled:', settleError);
          throw settleError;
        }

        // Mark webhook as processed
        await supabase
          .from('webhook_events')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            processing_time_ms: Date.now() - startTime,
          })
          .eq('provider', 'wise')
          .eq('payload->data->resource->>id', transferId.toString())
          .is('processed', false);

        console.log('✅ Settlement completed:', { invoiceRef: invoice.ref, transferId });

      } else if (currentState === 'bounced_back' || currentState === 'funds_refunded') {
        console.error('❌ Wise transfer failed:', { transferId, state: currentState });

        // Mark webhook as processed with error
        await supabase
          .from('webhook_events')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            processing_time_ms: Date.now() - startTime,
            error_message: `Transfer ${currentState}`,
          })
          .eq('provider', 'wise')
          .eq('payload->data->resource->>id', transferId.toString())
          .is('processed', false);

        // TODO: Update payment status to 'error' or keep as 'confirmed'?
      } else {
        console.log('ℹ️ Intermediate state:', currentState);
        // Just log, don't update database yet
      }
    }

    return json({ ok: true });

  } catch (error) {
    console.error('❌ Error processing Wise webhook:', error);
    
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
        .eq('provider', 'wise')
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
