import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useSolanaPay, PaymentRequest } from '@/hooks/useSolanaPay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type PaymentStatus = 'generating' | 'active' | 'expired' | 'paid' | 'error';

interface SolanaPayQRProps {
  recipient: string;
  amount: number; // Amount in BRL (will be converted)
  existingReference?: string; // Use existing invoice reference instead of generating new one
  label?: string;
  message?: string;
  onPaymentConfirmed?: (txHash: string) => void;
  onExpired?: () => void;
  expirationMinutes?: number;
}

export function SolanaPayQR({
  recipient,
  amount,
  existingReference,
  label,
  message,
  onPaymentConfirmed,
  onExpired,
  expirationMinutes = 10,
}: SolanaPayQRProps) {
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('generating');
  const [timeRemaining, setTimeRemaining] = useState(expirationMinutes * 60);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  
  const { createPaymentRequest, validatePayment, isGenerating, error } = useSolanaPay();
  const { toast } = useToast();

  const generateQR = async () => {
    setStatus('generating');
    setTimeRemaining(expirationMinutes * 60);

    try {
      const recipientPubkey = new PublicKey(recipient);
      const amountBigNumber = new BigNumber(amount);

      const request = await createPaymentRequest({
        recipient: recipientPubkey,
        amount: amountBigNumber,
        label: label || `Payment of R$ ${amount.toFixed(2)}`,
        message: message || 'Thank you for your payment',
      });

      if (request) {
        setPaymentRequest(request);
        setStatus('active');
        // Use existingReference (invoice ref) for polling instead of generated PublicKey
        startPolling(existingReference || request.reference.toString());
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Failed to generate QR:', err);
      setStatus('error');
    }
  };

  const startPolling = (reference: string) => {
    // Clear existing interval
    if (pollInterval) {
      clearInterval(pollInterval);
    }

    // Poll every 3 seconds
    const interval = setInterval(async () => {
      const result = await validatePayment(reference);
      
      if (result && result.status === 'confirmed' && result.tx) {
        setStatus('paid');
        clearInterval(interval);
        onPaymentConfirmed?.(result.tx);
        toast({
          title: "Payment Confirmed!",
          description: `Transaction: ${result.tx.slice(0, 8)}...`,
        });
      }
    }, 3000);

    setPollInterval(interval);
  };

  const copyToClipboard = async () => {
    if (!paymentRequest) return;
    
    try {
      await navigator.clipboard.writeText(paymentRequest.url.toString());
      toast({
        title: "Link Copied!",
        description: "Payment link copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (status !== 'active') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setStatus('expired');
          if (pollInterval) clearInterval(pollInterval);
          onExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, pollInterval, onExpired]);

  // Initial generation
  useEffect(() => {
    generateQR();
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error || 'Failed to generate payment QR code'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Solana Pay</span>
          {status === 'active' && (
            <span className="flex items-center text-sm font-normal text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeRemaining)}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Scan the QR code with your Solana wallet
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center gap-4">
        {status === 'generating' && (
          <div className="flex flex-col items-center gap-2 py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating QR code...</p>
          </div>
        )}

        {paymentRequest && status === 'active' && (
          <>
            <img
              src={paymentRequest.qrCode}
              alt="Payment QR Code"
              className="w-64 h-64 border-4 border-border rounded-lg"
            />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                R$ {amount.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {message || label}
              </p>
            </div>
          </>
        )}

        {status === 'paid' && (
          <div className="flex flex-col items-center gap-2 py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="text-lg font-semibold text-green-600">Payment Confirmed!</p>
          </div>
        )}

        {status === 'expired' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-lg font-semibold text-destructive">QR Code Expired</p>
            <Button onClick={generateQR}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New QR
            </Button>
          </div>
        )}
      </CardContent>
      
      {paymentRequest && status === 'active' && (
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={copyToClipboard}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button
            variant="outline"
            onClick={generateQR}
            disabled={isGenerating}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

