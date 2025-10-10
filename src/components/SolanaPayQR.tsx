import { useEffect, useState } from 'react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import BigNumber from 'bignumber.js';
import { useSolanaPay, PaymentRequest } from '@/hooks/useSolanaPay';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, RefreshCw, CheckCircle2, Clock, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBrzMint } from '@/lib/solana-config';
import { DebugPanel } from '@/components/DebugPanel';
import { TokenInfo, getDefaultPaymentToken } from '@/lib/tokens';
import { useAutoSwap } from '@/hooks/useAutoSwap';

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
  paymentToken?: TokenInfo; // Token customer will use to pay (defaults to tBRZ/BRZ)
  settlementToken?: TokenInfo; // Token merchant wants to receive (for Jupiter swap)
  autoSwapEnabled?: boolean; // Whether to enable Jupiter auto-swap
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
  paymentToken,
  settlementToken,
  autoSwapEnabled = false,
}: SolanaPayQRProps) {
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('generating');
  const [timeRemaining, setTimeRemaining] = useState(expirationMinutes * 60);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  const { createPaymentRequest, validatePayment, isGenerating, error } = useSolanaPay();
  const { toast } = useToast();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { processAutoSwap } = useAutoSwap();

  const generateQR = async () => {
    setStatus('generating');
    setTimeRemaining(expirationMinutes * 60);

    try {
      const recipientPubkey = new PublicKey(recipient);
      const amountBigNumber = new BigNumber(amount);
      
      // Use provided payment token or fallback to default (tBRZ/BRZ)
      const tokenToUse = paymentToken || getDefaultPaymentToken();
      const tokenMint = new PublicKey(tokenToUse.mint);

      console.log('🎫 Generating Solana Pay QR:', {
        recipient: recipient,
        amount: amount,
        paymentToken: tokenToUse.symbol,
        tokenMint: tokenMint.toString(),
        autoSwap: autoSwapEnabled,
        settlementToken: settlementToken?.symbol,
      });

      const request = await createPaymentRequest({
        recipient: recipientPubkey,
        amount: amountBigNumber,
        label: label || `Payment of R$ ${amount.toFixed(2)}`,
        message: message || 'Thank you for your payment',
        splToken: tokenMint,
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

  const handlePayWithWallet = async () => {
    if (!publicKey || !paymentRequest) {
      toast({
        title: "Wallet não conectada",
        description: "Por favor, conecte sua wallet primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const recipientPubkey = new PublicKey(recipient);
      
      // Use provided payment token or fallback to default
      const tokenToUse = paymentToken || getDefaultPaymentToken();
      const tokenMint = new PublicKey(tokenToUse.mint);

      if (!tokenMint) {
        throw new Error('Payment token not configured');
      }

      console.log('💰 Sending payment:', {
        from: publicKey.toString(),
        to: recipient,
        amount: amount,
        token: tokenToUse.symbol,
        mint: tokenMint.toString(),
        reference: paymentRequest.reference.toString(),
      });

      // Get ATAs for the payment token
      const fromAta = await getAssociatedTokenAddress(tokenMint, publicKey);
      const toAta = await getAssociatedTokenAddress(tokenMint, recipientPubkey);

      // Convert amount to token units (using token's decimals)
      const tokenAmount = Math.floor(amount * Math.pow(10, tokenToUse.decimals));

      console.log('🔢 Token amount (minor units):', tokenAmount);

      // Create transaction
      const transaction = new Transaction();
      
      // Add transfer instruction with memo (reference)
      transaction.add(
        createTransferInstruction(
          fromAta,
          toAta,
          publicKey,
          tokenAmount,
          [],
          undefined
        )
      );

      // Add reference as a memo
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: paymentRequest.reference,
          lamports: 0, // Just for memo/reference tracking
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      console.log('✅ Transaction sent:', signature);

      toast({
        title: "Pagamento enviado!",
        description: "Aguardando confirmação on-chain...",
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      console.log('✅ Transaction confirmed:', signature);
      
      setStatus('paid');
      if (onPaymentConfirmed) {
        onPaymentConfirmed(signature);
      }

    } catch (err) {
      console.error('❌ Payment error:', err);
      toast({
        title: "Erro no pagamento",
        description: err instanceof Error ? err.message : 'Falha ao enviar transação',
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
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
          {/* Primary action: Pay with connected wallet (desktop) */}
          {publicKey ? (
            <Button
              variant="default"
              className="w-full"
              onClick={handlePayWithWallet}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Pagar com Wallet Conectada
                </>
              )}
            </Button>
          ) : (
            <Alert>
              <AlertDescription className="text-sm">
                💡 <strong>Desktop:</strong> Conecte sua wallet no header para pagar com um clique!
              </AlertDescription>
            </Alert>
          )}
          
          {/* Secondary actions */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyLink}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Link
            </Button>
            <Button
              variant="outline"
              onClick={generateQR}
              disabled={isGenerating}
              className="px-3"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center w-full">
            {publicKey 
              ? "💳 Pagamento direto ativo"
              : "📱 Mobile: Escaneie o QR · 💻 Desktop: Conecte wallet"
            }
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

