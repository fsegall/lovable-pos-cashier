import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SettlementSummary {
  totalPayments: number;
  totalVolumeBRL: number;
  holdingCrypto: number;
  settledCount: number;
  cryptoBalanceBRL: number;
  settledTotal: number;
  totalFees: number;
  settlementSuccessRate: number;
  avgConfirmSeconds: number;
  avgSettlementSeconds: number;
}

export interface SettlementRequest {
  paymentId: string;
  provider: 'circle' | 'wise';
  currency: string;
  amount: number;
  recipientId: string;
}

export function useSettlements() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSummary = useCallback(async (): Promise<SettlementSummary | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_my_settlement_summary');

      if (rpcError) {
        throw rpcError;
      }

      if (!data || data.length === 0) {
        // Return empty summary if no data
        return {
          totalPayments: 0,
          totalVolumeBRL: 0,
          holdingCrypto: 0,
          settledCount: 0,
          cryptoBalanceBRL: 0,
          settledTotal: 0,
          totalFees: 0,
          settlementSuccessRate: 0,
          avgConfirmSeconds: 0,
          avgSettlementSeconds: 0,
        };
      }

      const summary = data[0];
      return {
        totalPayments: Number(summary.total_payments || 0),
        totalVolumeBRL: Number(summary.total_volume_brl || 0),
        holdingCrypto: Number(summary.holding_crypto || 0),
        settledCount: Number(summary.settled_count || 0),
        cryptoBalanceBRL: Number(summary.crypto_balance_brl || 0),
        settledTotal: Number(summary.settled_total || 0),
        totalFees: Number(summary.total_fees || 0),
        settlementSuccessRate: Number(summary.settlement_success_rate || 0),
        avgConfirmSeconds: Number(summary.avg_confirm_seconds || 0),
        avgSettlementSeconds: Number(summary.avg_settlement_seconds || 0),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch summary';
      setError(message);
      console.error('Error fetching settlement summary:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestSettlement = useCallback(async (
    request: SettlementRequest
  ): Promise<{ success: boolean; settlementId?: string; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      console.log('💰 Requesting settlement:', request);

      // Call appropriate Edge Function based on provider
      const functionName = request.provider === 'circle' ? 'circle-payout' : 'wise-payout';
      
      const { data, error: invokeError } = await supabase.functions.invoke(functionName, {
        body: {
          paymentId: request.paymentId,
          amount: request.amount,
          currency: request.currency,
          recipientId: request.recipientId,
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Settlement request failed');
      }

      console.log('✅ Settlement requested:', data);

      return {
        success: true,
        settlementId: data.transferId || data.payoutId,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request settlement';
      setError(message);
      console.error('Error requesting settlement:', err);
      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getSummary,
    requestSettlement,
  };
}

