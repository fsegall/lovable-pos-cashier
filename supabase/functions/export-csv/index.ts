// supabase/functions/export-csv/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { userClient } from "../_shared/supabase.ts";
import { csv } from "../_shared/responses.ts";

serve(async (req) => {
  const searchParams = new URL(req.url).searchParams;
  const date = searchParams.get('date');
  const targetDate = date ? new Date(date) : new Date();
  
  // Calcular range do dia
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const supabase = userClient(req);

  try {
    // Usar RPC function que respeita RLS
    const { data: receipts, error } = await supabase.rpc('list_receipts', {
      _from: startOfDay.toISOString(),
      _to: endOfDay.toISOString()
    });

    if (error) throw error;

    // Gerar CSV
    const csvHeader = 'created_at,amount_brl,status,ref,tx_hash\n';
    const csvRows = receipts.map((r: any) => 
      `${r.created_at},${r.amount_brl},${r.status},${r.ref},${r.tx_hash || ''}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;
    const filename = `receipts_${targetDate.toISOString().split('T')[0]}.csv`;

    return csv(csvContent, filename);

  } catch (error) {
    console.error('CSV export error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
