import { useState, useCallback } from 'react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { encodeURL, createQR, TransferRequestURL } from '@solana/pay';
import BigNumber from 'bignumber.js';

export interface PaymentRequest {
  reference: PublicKey;
  url: URL;
  qrCode: string;
}

export function useSolanaPay() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReference = useCallback((): PublicKey => {
    return Keypair.generate().publicKey;
  }, []);

  const createPaymentRequest = useCallback(
    async (params: {
      recipient: PublicKey;
      amount: BigNumber;
      label?: string;
      message?: string;
      splToken?: PublicKey;
    }): Promise<PaymentRequest | null> => {
      setIsGenerating(true);
      setError(null);

      try {
        const reference = generateReference();
        
        // Create Solana Pay URL
        const url = encodeURL({
          recipient: params.recipient,
          amount: params.amount,
          reference,
          label: params.label || 'Payment',
          message: params.message || 'Thank you for your payment',
          splToken: params.splToken,
        });

        // Generate QR code as data URL
        const qr = createQR(url);
        const qrBlob = await qr.getRawData('png');
        if (!qrBlob) throw new Error('Failed to generate QR code');
        
        const qrDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(qrBlob);
        });

        return {
          reference,
          url,
          qrCode: qrDataUrl,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create payment request';
        setError(message);
        console.error('Error creating payment request:', err);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [generateReference]
  );

  const validatePayment = useCallback(
    async (reference: string): Promise<{ status: string; tx?: string } | null> => {
      try {
        // Use local Supabase if running on localhost, otherwise use production
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const supabaseUrl = isLocal 
          ? (import.meta.env.VITE_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321')
          : (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL);
        
        if (!supabaseUrl) {
          throw new Error('Supabase URL not configured');
        }

        console.log('🔍 Validating payment via:', supabaseUrl);

        const response = await fetch(`${supabaseUrl}/functions/v1/validate-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        });

        if (!response.ok) {
          throw new Error(`Validation failed: ${response.statusText}`);
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to validate payment';
        setError(message);
        console.error('Error validating payment:', err);
        return null;
      }
    },
    []
  );

  return {
    isGenerating,
    error,
    generateReference,
    createPaymentRequest,
    validatePayment,
  };
}

