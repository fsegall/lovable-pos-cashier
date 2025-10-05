// supabase/functions/get-receipt-pdf/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { adminClient } from "../_shared/supabase.ts";
import { pdf } from "../_shared/responses.ts";
import { json } from "../_shared/responses.ts";

serve(async (req) => {
  const { paymentId } = new URL(req.url).searchParams;
  if (!paymentId) return json({ error: 'Missing paymentId' }, 400);

  const supabase = adminClient();
  const TRANSFERO_BASE_URL = Deno.env.get('TRANSFERO_BASE_URL');
  const TRANSFERO_CLIENT_ID = Deno.env.get('TRANSFERO_CLIENT_ID');
  const TRANSFERO_CLIENT_SECRET = Deno.env.get('TRANSFERO_CLIENT_SECRET');

  try {
    // Buscar payment para verificar se está settled
    const { data: payment } = await supabase
      .from('payments')
      .select('*, invoices!inner(*)')
      .eq('pix_payment_id', paymentId)
      .single();

    if (!payment) return json({ error: 'Payment not found' }, 404);
    if (payment.status !== 'settled') {
      return json({ error: 'Payment not settled' }, 400);
    }

    // Se Transfero estiver configurado, buscar PDF real
    if (TRANSFERO_BASE_URL && TRANSFERO_CLIENT_ID && TRANSFERO_CLIENT_SECRET) {
      try {
        // TODO: Implementar OAuth e busca de PDF real
        /*
        const tokenResponse = await fetch(`${TRANSFERO_BASE_URL}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: TRANSFERO_CLIENT_ID,
            client_secret: TRANSFERO_CLIENT_SECRET
          })
        });
        
        const { access_token } = await tokenResponse.json();
        
        const pdfResponse = await fetch(`${TRANSFERO_BASE_URL}/v2/payments/${paymentId}/receipt`, {
          headers: { 'Authorization': `Bearer ${access_token}` }
        });
        
        if (pdfResponse.ok) {
          const pdfBuffer = await pdfResponse.arrayBuffer();
          return pdf(new Uint8Array(pdfBuffer));
        }
        */
        
        // Por enquanto, retornar erro 501 (not implemented)
        return json({ error: 'PDF not available yet' }, 501);
        
      } catch (error) {
        console.error('Transfero PDF error:', error);
        return json({ error: 'PDF service unavailable' }, 503);
      }
    }

    // PDF não disponível
    return json({ error: 'PDF not available' }, 404);

  } catch (error) {
    console.error('PDF error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
});
