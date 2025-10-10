// Jupiter Swap Hook
// Enables accepting any SPL token and auto-swapping to tBRZ (or other target token)

import { useCallback, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import { createJupiterApiClient, QuoteGetRequest, QuoteResponse } from '@jup-ag/api';
import { getBrzMint } from '@/lib/solana-config';

const JUPITER_API_URL = 'https://quote-api.jup.ag/v6';

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  fee: number;
  route: QuoteResponse;
}

export interface SwapResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export function useJupiterSwap() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get quote from Jupiter
  const getQuote = useCallback(async (
    inputMint: string,
    amount: number, // Amount in UI units (not minor units)
    outputMint?: string
  ): Promise<SwapQuote | null> => {
    try {
      setError(null);
      const targetMint = outputMint || getBrzMint();
      
      // Convert amount to minor units (assuming 6 decimals for most SPL tokens)
      const amountInMinorUnits = Math.floor(amount * 1_000_000);

      console.log('🔍 Getting Jupiter quote:', {
        inputMint,
        outputMint: targetMint,
        amount: amountInMinorUnits
      });

      const jupiterClient = createJupiterApiClient({ basePath: JUPITER_API_URL });
      
      const quote = await jupiterClient.quoteGet({
        inputMint,
        outputMint: targetMint,
        amount: amountInMinorUnits,
        slippageBps: 50, // 0.5% slippage tolerance
        onlyDirectRoutes: false,
        asLegacyTransaction: false,
      });

      if (!quote) {
        throw new Error('No quote returned from Jupiter');
      }

      // Calculate price impact and fees
      const inAmount = Number(quote.inAmount) / 1_000_000;
      const outAmount = Number(quote.outAmount) / 1_000_000;
      const priceImpactPct = quote.priceImpactPct ? Number(quote.priceImpactPct) : 0;
      
      // Calculate total fees (platform + liquidity provider)
      const totalFeeAmount = quote.routePlan?.reduce((sum, step) => {
        return sum + (step.swapInfo?.feeAmount ? Number(step.swapInfo.feeAmount) : 0);
      }, 0) || 0;
      const fee = totalFeeAmount / 1_000_000;

      console.log('✅ Quote received:', {
        inAmount,
        outAmount,
        priceImpactPct,
        fee,
        routes: quote.routePlan?.length
      });

      return {
        inputMint,
        outputMint: targetMint,
        inAmount: inAmount.toString(),
        outAmount: outAmount.toString(),
        priceImpactPct,
        fee,
        route: quote,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get quote';
      setError(message);
      console.error('Error getting Jupiter quote:', err);
      return null;
    }
  }, []);

  // Execute swap
  const executeSwap = useCallback(async (
    quote: SwapQuote
  ): Promise<SwapResult> => {
    try {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      console.log('💱 Executing swap via Jupiter...');

      const jupiterClient = createJupiterApiClient({ basePath: JUPITER_API_URL });

      // Get swap transaction
      const swapResponse = await jupiterClient.swapPost({
        swapRequest: {
          quoteResponse: quote.route,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
          computeUnitPriceMicroLamports: 'auto',
          // dynamicComputeUnitLimit: true, // Auto-calculate compute units
        },
      });

      if (!swapResponse.swapTransaction) {
        throw new Error('No swap transaction returned');
      }

      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      console.log('📝 Transaction prepared, sending...');

      // Send transaction
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        maxRetries: 3,
      });

      console.log('⏳ Confirming transaction:', signature);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('✅ Swap completed:', signature);

      return {
        success: true,
        signature,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Swap failed';
      setError(message);
      console.error('Error executing swap:', err);
      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  }, [publicKey, sendTransaction, connection]);

  return {
    getQuote,
    executeSwap,
    loading,
    error,
  };
}

