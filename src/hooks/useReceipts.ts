import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseHelpers } from '@/lib/supabase-helpers';
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

      const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // last 90 days
      const to = new Date();
      
      const receiptsData = await supabaseHelpers.listReceipts(from, to);
      setReceipts(receiptsData);
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

      const invoiceId = await supabaseHelpers.createInvoiceWithPayment(
        amount,
        ref,
        productIds || []
      );

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
      await supabaseHelpers.updatePaymentStatus(id, status, txHash);
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
