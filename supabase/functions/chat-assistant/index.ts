import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const authHeader = req.headers.get('Authorization');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user from auth header
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get merchant_id
    const { data: memberData } = await supabase
      .from('merchant_members')
      .select('merchant_id')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .eq('status', 'active')
      .single();

    if (!memberData) {
      throw new Error('No merchant found');
    }

    const merchantId = memberData.merchant_id;

    // Define tools for the AI
    const tools = [
      {
        type: "function",
        function: {
          name: "list_payments",
          description: "Lista pagamentos com filtros opcionais (status, período)",
          parameters: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["pending", "confirmed", "settled", "error"],
                description: "Filtrar por status"
              },
              days: {
                type: "number",
                description: "Número de dias para trás (padrão: 30)"
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "cancel_payment",
          description: "Cancela um pagamento pendente usando sua referência (ref)",
          parameters: {
            type: "object",
            properties: {
              ref: {
                type: "string",
                description: "Referência do pagamento (ex: REF123)"
              }
            },
            required: ["ref"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_payment_stats",
          description: "Retorna estatísticas de pagamentos (total, média, por status)",
          parameters: {
            type: "object",
            properties: {
              days: {
                type: "number",
                description: "Número de dias para análise (padrão: 30)"
              }
            }
          }
        }
      }
    ];

    // Tool execution function
    async function executeTool(toolName: string, args: any) {
      console.log('Executing tool:', toolName, 'with args:', args);
      
      switch (toolName) {
        case 'list_payments': {
          const days = args.days || 30;
          const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
          
          let query = supabase
            .from('invoices')
            .select(`
              id, ref, amount_brl, status, created_at,
              payments(id, status, tx_hash)
            `)
            .eq('merchant_id', merchantId)
            .gte('created_at', fromDate)
            .order('created_at', { ascending: false });

          if (args.status) {
            query = query.eq('status', args.status);
          }

          const { data, error } = await query;
          if (error) throw error;

          return {
            payments: data.map(inv => ({
              ref: inv.ref,
              amount: inv.amount_brl,
              status: inv.status,
              date: inv.created_at,
              txHash: inv.payments?.[0]?.tx_hash
            })),
            count: data.length
          };
        }

        case 'cancel_payment': {
          const { data: invoice, error: findError } = await supabase
            .from('invoices')
            .select('id, status')
            .eq('merchant_id', merchantId)
            .eq('ref', args.ref)
            .single();

          if (findError || !invoice) {
            return { success: false, message: 'Pagamento não encontrado' };
          }

          if (invoice.status !== 'pending') {
            return { success: false, message: `Não é possível cancelar pagamento com status ${invoice.status}` };
          }

          const { error: updateError } = await supabase
            .from('invoices')
            .update({ status: 'error' })
            .eq('id', invoice.id);

          if (updateError) throw updateError;

          await supabase
            .from('payments')
            .update({ status: 'error' })
            .eq('invoice_id', invoice.id);

          return { success: true, message: `Pagamento ${args.ref} cancelado` };
        }

        case 'get_payment_stats': {
          const days = args.days || 30;
          const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

          const { data, error } = await supabase
            .from('invoices')
            .select('amount_brl, status')
            .eq('merchant_id', merchantId)
            .gte('created_at', fromDate);

          if (error) throw error;

          const stats = {
            total: data.reduce((sum, inv) => sum + Number(inv.amount_brl), 0),
            count: data.length,
            average: data.length > 0 ? data.reduce((sum, inv) => sum + Number(inv.amount_brl), 0) / data.length : 0,
            byStatus: {
              pending: data.filter(inv => inv.status === 'pending').length,
              confirmed: data.filter(inv => inv.status === 'confirmed').length,
              settled: data.filter(inv => inv.status === 'settled').length,
              error: data.filter(inv => inv.status === 'error').length
            }
          };

          return stats;
        }

        default:
          return { error: 'Tool not found' };
      }
    }

    // Initial AI call
    let aiMessages = [
      {
        role: "system",
        content: `Você é um assistente especializado em gestão de pagamentos. Você ajuda comerciantes a:
- Listar e consultar pagamentos (pendentes, confirmados, liquidados)
- Cancelar pagamentos pendentes quando solicitado
- Gerar estatísticas e extratos
- Responder perguntas sobre os pagamentos

Seja conciso, profissional e sempre confirme ações importantes antes de executar (especialmente cancelamentos).
Use as ferramentas disponíveis para buscar informações reais do banco de dados.
Valores sempre em BRL (Reais brasileiros).`
      },
      ...messages
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        tools: tools,
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Error:', response.status, errorText);
      throw new Error(`AI Error: ${response.status}`);
    }

    let result = await response.json();
    let assistantMessage = result.choices[0].message;

    // Handle tool calls
    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log('Tool calls requested:', assistantMessage.tool_calls.length);
      
      aiMessages.push(assistantMessage);

      // Execute all tool calls
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        const toolResult = await executeTool(toolName, toolArgs);
        
        aiMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        });
      }

      // Get next AI response
      const nextResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
          tools: tools,
          tool_choice: "auto"
        }),
      });

      if (!nextResponse.ok) {
        throw new Error(`AI Error: ${nextResponse.status}`);
      }

      result = await nextResponse.json();
      assistantMessage = result.choices[0].message;
    }

    return new Response(
      JSON.stringify({ message: assistantMessage.content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
