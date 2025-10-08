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
      if (!user) return [];

      const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // last 90 days
      const to = new Date();
      
      console.log('🔵 Fetching receipts from DB...');
      const receiptsData = await supabaseHelpers.listReceipts(from, to);
      console.log('🟢 Receipts fetched:', receiptsData.length, 'items');
      console.log('📊 Receipt statuses:', receiptsData.map(r => ({ ref: r.ref, status: r.status })));
      setReceipts(receiptsData);
      return receiptsData;
    } catch (error) {
      console.error('Error fetching receipts:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createCharge = async (amount: number, productIds?: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const ref = `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Generate Solana Pay reference (PublicKey) for on-chain validation
      // We'll import this dynamically to avoid issues if not available
      let solanaReference: string | undefined;
      try {
        const { Keypair } = await import('@solana/web3.js');
        solanaReference = Keypair.generate().publicKey.toString();
        console.log('🔑 Generated Solana reference:', solanaReference);
      } catch (e) {
        console.warn('⚠️ Could not generate Solana reference:', e);
      }

      await supabaseHelpers.createInvoiceWithPayment(
        amount,
        ref,
        productIds || [],
        solanaReference
      );

      const updatedReceipts = await fetchReceipts();

      // Retorna o receipt recém-criado da lista atualizada
      const newReceipt = updatedReceipts.find(r => r.ref === ref);
      return newReceipt || null;
    } catch (error) {
      console.error('Error creating charge:', error);
      return null;
    }
  };

  const updateReceiptStatus = async (
    ref: string,
    status: Receipt['status'],
    txHash?: string
  ) => {
    try {
      console.log('🔵 updateReceiptStatus START:', { ref, status, txHash });
      await supabaseHelpers.updatePaymentStatus(ref, status, txHash);
      console.log('🟢 updatePaymentStatus completed');
      
      // Refetch PRIMEIRO para ter os dados atualizados
      console.log('🔵 About to refetch receipts...');
      const updatedReceipts = await fetchReceipts();
      console.log('🟢 Receipts refetched, new count:', updatedReceipts.length);
      
      // AGORA busca o receipt na lista atualizada
      if (status === 'confirmed' && txHash) {
        const receipt = updatedReceipts.find(r => r.ref === ref);
        console.log('🔵 Looking for receipt to create:', { ref, found: !!receipt, paymentId: receipt?.paymentId });
        if (receipt && receipt.paymentId) {
          await supabaseHelpers.createReceipt(receipt.paymentId, {
            ref: receipt.ref,
            amount: receipt.amountBRL,
            status: status,
            txHash: txHash,
            timestamp: new Date().toISOString(),
          });
          console.log('🟢 Receipt created');
        }
      }
    } catch (error) {
      console.error('❌ Error updating receipt status:', error);
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
