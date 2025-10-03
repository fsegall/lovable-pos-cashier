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

      // Use helper function to list receipts
      // @ts-ignore - RPC function exists in database
      const { data, error } = await supabase.rpc('list_receipts', {
        _from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // last 90 days
        _to: new Date().toISOString(),
      });

      if (error) {
        console.error('Error fetching receipts:', error);
        return;
      }

      if (data) {
        // @ts-ignore - data is array from RPC function
        const receiptsData: Receipt[] = data.map((item: any) => ({
          id: item.id,
          amountBRL: Number(item.amount_brl),
          createdAt: item.created_at,
          status: item.status as Receipt['status'],
          ref: item.ref,
          txHash: item.tx_hash || undefined,
          productIds: item.product_ids || undefined,
        }));
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

      const ref = `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Use helper function to create invoice + payment
      // @ts-ignore - RPC function exists in database
      const { data: invoiceId, error } = await supabase.rpc('create_invoice_with_payment', {
        _amount_brl: amount,
        _ref: ref,
        _product_ids: productIds || [],
      });

      if (error) {
        console.error('Error creating invoice:', error);
        return null;
      }

      await fetchReceipts();

      return {
        id: invoiceId,
        amountBRL: amount,
        createdAt: new Date().toISOString(),
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
      // Use helper function to update payment status
      // @ts-ignore - RPC function exists in database
      const { error } = await supabase.rpc('update_payment_status', {
        _invoice_id: id,
        _new_status: status,
        _tx_hash: txHash || null,
      });

      if (error) {
        console.error('Error updating receipt status:', error);
        return;
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
