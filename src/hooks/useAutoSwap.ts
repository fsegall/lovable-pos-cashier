// Auto-Swap Hook
// Manages automatic token swapping after payment confirmation
// When customer pays with Token X but merchant wants Token Y, this handles the conversion

import { useCallback } from 'react';
import { useJupiterSwap } from './useJupiterSwap';
import { TokenInfo } from '@/lib/tokens';

export interface AutoSwapConfig {
  enabled: boolean;
  inputToken: TokenInfo;
  outputToken: TokenInfo;
  slippageBps?: number;
}

export interface AutoSwapResult {
  success: boolean;
  swapSignature?: string;
  finalToken: TokenInfo;
  finalAmount: number;
  error?: string;
}

export function useAutoSwap() {
  const { getQuote, executeSwap } = useJupiterSwap();

  /**
   * Process auto-swap if needed
   * Returns the final token and amount after swap (or original if no swap needed)
   */
  const processAutoSwap = useCallback(async (
    config: AutoSwapConfig,
    receivedAmount: number
  ): Promise<AutoSwapResult> => {
    try {
      // If auto-swap disabled or tokens match, no swap needed
      if (!config.enabled || config.inputToken.mint === config.outputToken.mint) {
        console.log('✅ No swap needed:', {
          autoSwapEnabled: config.enabled,
          sameToken: config.inputToken.mint === config.outputToken.mint,
        });
        
        return {
          success: true,
          finalToken: config.inputToken,
          finalAmount: receivedAmount,
        };
      }

      console.log('🪐 Auto-swap required:', {
        from: config.inputToken.symbol,
        to: config.outputToken.symbol,
        amount: receivedAmount,
      });

      // Step 1: Get swap quote
      console.log('📊 Step 1: Getting Jupiter quote...');
      const quote = await getQuote(
        config.inputToken.mint,
        receivedAmount,
        config.outputToken.mint
      );

      if (!quote) {
        throw new Error('Failed to get swap quote from Jupiter');
      }

      console.log('✅ Quote received:', {
        inAmount: quote.inAmount,
        outAmount: quote.outAmount,
        priceImpact: `${quote.priceImpactPct}%`,
        fee: quote.fee,
      });

      // Step 2: Execute swap
      console.log('💱 Step 2: Executing swap...');
      const swapResult = await executeSwap(quote);

      if (!swapResult.success) {
        throw new Error(swapResult.error || 'Swap execution failed');
      }

      console.log('✅ Swap completed!', {
        signature: swapResult.signature,
        finalToken: config.outputToken.symbol,
        estimatedAmount: quote.outAmount,
      });

      return {
        success: true,
        swapSignature: swapResult.signature,
        finalToken: config.outputToken,
        finalAmount: parseFloat(quote.outAmount),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auto-swap failed';
      console.error('❌ Auto-swap error:', err);
      
      // Return original token on error (merchant still gets something!)
      return {
        success: false,
        error: message,
        finalToken: config.inputToken,
        finalAmount: receivedAmount,
      };
    }
  }, [getQuote, executeSwap]);

  return {
    processAutoSwap,
  };
}

