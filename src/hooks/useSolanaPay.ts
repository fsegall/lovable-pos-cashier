import { useState, useCallback } from 'react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { encodeURL, createQR, TransferRequestURL } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { supabase } from '@/integrations/supabase/client';

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
        console.log('🔍 Validating payment for reference:', reference);

        const { data, error: invokeError } = await supabase.functions.invoke('validate-payment', {
          body: { reference },
        });

        if (invokeError) {
          throw new Error(`Validation failed: ${invokeError.message}`);
        }

        console.log('✅ Validation response:', data);
        return data;
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

