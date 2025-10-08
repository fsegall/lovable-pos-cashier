// supabase/functions/_shared/responses.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders 
    }
  });
}

export function pdf(body: ArrayBuffer): Response {
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/pdf' } });
}

export function csv(text: string, filename = 'export.csv'): Response {
  return new Response(text, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
