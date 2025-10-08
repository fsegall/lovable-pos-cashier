import { supabase } from '@/integrations/supabase/client';
import { Receipt } from '@/types/store';

/**
 * Helper centralizado para chamar RPCs do schema app
 * Remove @ts-ignore dos hooks e centraliza a lógica
 */

export const supabaseHelpers = {
  /**
   * Lista receipts do merchant atual no período especificado
   */
  async listReceipts(from: Date, to: Date): Promise<Receipt[]> {
    // @ts-ignore - RPC function exists in database
    const { data, error } = await supabase.rpc('list_receipts', {
      _from: from.toISOString(),
      _to: to.toISOString(),
    });

    if (error) {
      console.error('Error listing receipts:', error);
      throw error;
    }

    if (!data || !Array.isArray(data)) return [];

    console.log('🔵 RAW data from list_receipts RPC:', data[0]); // Log first item to see structure

    // @ts-ignore - data is array from RPC function
    return data.map((item: any) => {
      const mapped = {
        id: item.id,
        amountBRL: Number(item.amount_brl),
        createdAt: item.created_at,
        status: item.status as Receipt['status'],
        ref: item.ref,
        txHash: item.tx_hash || undefined,
        productIds: item.product_ids || undefined,
        paymentId: item.payment_id || undefined,
      };
      console.log('🟡 Mapped receipt:', { ref: mapped.ref, paymentId: mapped.paymentId });
      return mapped;
    });
  },

  /**
   * Cria invoice + payment automaticamente
   */
  async createInvoiceWithPayment(
    amountBRL: number,
    ref: string,
    productIds: string[] = [],
    reference?: string
  ): Promise<string> {
    // @ts-ignore - RPC function exists in database
    const { data, error } = await supabase.rpc('create_invoice_with_payment', {
      _amount_brl: amountBRL,
      _ref: ref,
      _product_ids: productIds,
      _reference: reference || null,
    });

    if (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }

    // Retorna o ref da invoice criada
    return data?.[0]?.ref || ref;
  },

  /**
   * Atualiza status de payment (e invoice automaticamente)
   */
  async updatePaymentStatus(
    ref: string,
    status: Receipt['status'],
    txHash?: string
  ): Promise<void> {
    // @ts-ignore - RPC function exists in database
    const { error } = await supabase.rpc('update_payment_status', {
      _ref: ref,
      _status: status,
      _tx_hash: txHash || null,
    });

    if (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  /**
   * Marca invoice como confirmed (com tx_hash)
   */
  async markConfirmed(ref: string, txHash: string): Promise<void> {
    // @ts-ignore - RPC function exists in database
    const { error } = await supabase.rpc('mark_confirmed', {
      _ref: ref,
      _tx_hash: txHash,
    });

    if (error) {
      console.error('Error marking as confirmed:', error);
      throw error;
    }
  },

  /**
   * Marca invoice como settled
   */
  async markSettled(ref: string): Promise<void> {
    // @ts-ignore - RPC function exists in database
    const { error } = await supabase.rpc('mark_settled', {
      _ref: ref,
    });

    if (error) {
      console.error('Error marking as settled:', error);
      throw error;
    }
  },

  /**
   * Retorna o merchant padrão do usuário atual
   */
  async currentMerchant(): Promise<string | null> {
    // @ts-ignore - RPC function exists in database
    const { data, error } = await supabase.rpc('current_merchant');

    if (error) {
      console.error('Error getting current merchant:', error);
      return null;
    }

    // current_merchant retorna um array com um objeto, pegamos o id do primeiro
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    return data[0]?.id || null;
  },

  /**
   * Define merchant padrão do usuário
   */
  async setDefaultMerchant(merchantId: string): Promise<void> {
    // @ts-ignore - RPC function exists in database
    const { error } = await supabase.rpc('set_default_merchant', {
      _merchant_id: merchantId,
    });

    if (error) {
      console.error('Error setting default merchant:', error);
      throw error;
    }
  },

  /**
   * Cria um recibo para um pagamento confirmado
   */
  async createReceipt(paymentId: string, receiptData: any): Promise<void> {
    const { error } = await supabase
      .from('receipts')
      .insert({
        payment_id: paymentId,
        receipt_data: receiptData,
      });

    if (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  },
};
