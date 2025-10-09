import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useSolanaPay, PaymentRequest } from '@/hooks/useSolanaPay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBrzMint } from '@/lib/solana-config';
import { DebugPanel } from '@/components/DebugPanel';

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
      const brzMint = getBrzMint();

      console.log('🎫 Generating Solana Pay QR:', {
        recipient: recipient,
        amount: amount,
        brzMint: brzMint?.toString(),
      });

      const request = await createPaymentRequest({
        recipient: recipientPubkey,
        amount: amountBigNumber,
        label: label || `Payment of R$ ${amount.toFixed(2)}`,
        message: message || 'Thank you for your payment',
        splToken: brzMint || undefined,
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

  const handleCopyLink = () => {
    if (paymentRequest) {
      navigator.clipboard.writeText(paymentRequest.url.toString());
      toast({
        title: "Link copiado!",
        description: "Cole o link no Phantom para fazer o pagamento",
      });
    }
  };

  const handleOpenPhantom = () => {
    if (paymentRequest) {
      // Try to open in Phantom (works on mobile and some desktop setups)
      window.location.href = paymentRequest.url.toString();
    }
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
        <CardFooter className="flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="default"
              className="flex-1"
              onClick={handleOpenPhantom}
            >
              Open in Phantom
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyLink}
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
          </div>
          <p className="text-xs text-muted-foreground text-center w-full">
            Mobile? Scan QR · Desktop? Click "Open in Phantom" or copy link
          </p>
        </CardFooter>
      )}
      
      {/* Debug panel - show in development */}
      {import.meta.env.DEV && paymentRequest && (
        <div className="mt-4">
          <DebugPanel
            paymentUrl={paymentRequest.url.toString()}
            reference={paymentRequest.reference.toString()}
            amount={amount}
          />
        </div>
      )}
    </Card>
  );
}

