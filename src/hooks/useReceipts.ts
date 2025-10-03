import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Receipt } from '@/types/store';

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: members } = await supabase
        .from('merchant_members')
        .select('merchant_id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (!members) return;

      // Fetch invoices with their payments
      const { data: invoices } = await supabase
        .from('invoices')
        .select(`
          *,
          payments (*)
        `)
        .eq('merchant_id', members.merchant_id)
        .order('created_at', { ascending: false });

      if (invoices) {
        const receiptsData: Receipt[] = invoices.map((invoice) => {
          const payment = invoice.payments?.[0];
          return {
            id: invoice.id,
            amountBRL: Number(invoice.amount_brl),
            createdAt: invoice.created_at,
            status: invoice.status as Receipt['status'],
            ref: invoice.ref,
            txHash: payment?.tx_hash || undefined,
            productIds: invoice.product_ids || undefined,
          };
        });
        setReceipts(receiptsData);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCharge = async (amount: number, productIds?: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: members } = await supabase
        .from('merchant_members')
        .select('merchant_id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (!members) return null;

      const ref = `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          merchant_id: members.merchant_id,
          amount_brl: amount,
          ref,
          status: 'pending',
          product_ids: productIds || [],
        })
        .select()
        .single();

      if (invoiceError || !invoice) {
        console.error('Error creating invoice:', invoiceError);
        return null;
      }

      // Create payment
      await supabase.from('payments').insert({
        invoice_id: invoice.id,
        amount_brl: amount,
        status: 'pending',
      });

      await fetchReceipts();

      return {
        id: invoice.id,
        amountBRL: amount,
        createdAt: invoice.created_at,
        status: 'pending' as const,
        ref,
        productIds,
      };
    } catch (error) {
      console.error('Error creating charge:', error);
      return null;
    }
  };

  const updateReceiptStatus = async (
    id: string,
    status: Receipt['status'],
    txHash?: string
  ) => {
    try {
      // Update invoice
      await supabase.from('invoices').update({ status }).eq('id', id);

      // Update payment
      const { data: payments } = await supabase
        .from('payments')
        .select('id')
        .eq('invoice_id', id)
        .single();

      if (payments) {
        await supabase
          .from('payments')
          .update({
            status,
            ...(txHash && { tx_hash: txHash }),
          })
          .eq('id', payments.id);
      }

      await fetchReceipts();
    } catch (error) {
      console.error('Error updating receipt status:', error);
    }
  };

  return {
    receipts,
    loading,
    createCharge,
    updateReceiptStatus,
    refetch: fetchReceipts,
  };
}
