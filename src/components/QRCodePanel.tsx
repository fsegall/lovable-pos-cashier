import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Receipt } from '@/types/store';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, Maximize2, Sun, X, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReceipts } from '@/hooks/useReceipts';
import { useMerchant } from '@/hooks/useMerchant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SolanaPayQR } from '@/components/SolanaPayQR';
import { getMerchantRecipient } from '@/lib/solana-config';

interface QRCodePanelProps {
  receipt: Receipt;
  onClose: () => void;
}

export function QRCodePanel({ receipt, onClose }: QRCodePanelProps) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [fullscreen, setFullscreen] = useState(false);
  const [useSolanaPay, setUseSolanaPay] = useState(false);
  const { updateReceiptStatus } = useReceipts();
  const { flags } = useMerchant();

  // Check if Solana Pay is configured
  useEffect(() => {
    const merchantRecipient = getMerchantRecipient();
    setUseSolanaPay(!!merchantRecipient);
  }, []);

  useEffect(() => {
    if (receipt.status !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          updateReceiptStatus(receipt.id, 'error');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [receipt.status, receipt.id, updateReceiptStatus]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleCopy = () => {
    navigator.clipboard.writeText(`solana:pay?amount=${receipt.amountBRL}&ref=${receipt.ref}`);
    toast.success('Link copiado!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Pagamento Solana',
        text: `Pague R$ ${receipt.amountBRL.toFixed(2)}`,
        url: `solana:pay?amount=${receipt.amountBRL}&ref=${receipt.ref}`,
      });
    } else {
      handleCopy();
    }
  };

  const handleDevConfirm = async () => {
    const txHash = `TX${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await updateReceiptStatus(receipt.ref, 'confirmed', txHash);
    toast.success('Pagamento confirmado!');
  };

  const handleDevSettle = () => {
    updateReceiptStatus(receipt.ref, 'settled', receipt.txHash);
    toast.success('Pagamento liquidado!');
  };

  const handleViewReceipt = () => {
    navigate(`/receipts/${receipt.id}`);
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-pending',
      bg: 'bg-pending/10',
      title: 'Aguardando pagamento...',
    },
    confirmed: {
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10',
      title: 'Pagamento confirmado!',
    },
    settled: {
      icon: CheckCircle2,
      color: 'text-accent',
      bg: 'bg-accent/10',
      title: 'Pagamento liquidado!',
    },
    error: {
      icon: XCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      title: 'Pagamento expirado',
    },
  };

  const status = statusConfig[receipt.status];
  const StatusIcon = status.icon;

  const qrContent = `solana:pay?amount=${receipt.amountBRL}&ref=${receipt.ref}`;

  // Render Solana Pay if configured, otherwise fallback to mock
  if (useSolanaPay && receipt.status === 'pending') {
    const merchantRecipient = getMerchantRecipient();
    if (!merchantRecipient) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <SolanaPayQR
          recipient={merchantRecipient.toString()}
          amount={receipt.amountBRL}
          label={`Payment ${receipt.ref}`}
          message={`Pay R$ ${receipt.amountBRL.toFixed(2)}`}
          onPaymentConfirmed={(txHash) => {
            updateReceiptStatus(receipt.ref, 'confirmed', txHash);
          }}
          onExpired={() => {
            updateReceiptStatus(receipt.id, 'error');
          }}
        />
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          {flags?.demoMode && (
            <Button variant="outline" onClick={handleDevConfirm} className="flex-1">
              Dev: Confirmar
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={fullscreen ? 'fixed inset-0 z-50 bg-background flex items-center justify-center' : ''}
      >
        <Card className={fullscreen ? 'w-full h-full border-0 rounded-none' : 'p-6'}>
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 ${status.color}`}>
              <StatusIcon className="w-6 h-6" />
              <span className="font-semibold">{status.title}</span>
            </div>
            {fullscreen && (
              <Button variant="ghost" size="icon" onClick={() => setFullscreen(false)}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {receipt.status === 'pending' && (
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground">Tempo restante</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary">
                  R$ {receipt.amountBRL.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Valor</div>
              </div>
            </div>
          )}

          {(receipt.status === 'confirmed' || receipt.status === 'settled') && (
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-primary mb-2">
                R$ {receipt.amountBRL.toFixed(2)}
              </div>
              {receipt.txHash && (
                <div className="text-sm text-muted-foreground">
                  Tx: {receipt.txHash}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Ref: {receipt.ref}
              </div>
            </div>
          )}

          {receipt.status === 'pending' && (
            <>
              <div className="flex justify-center mb-6">
                <div className={`p-4 bg-background rounded-xl ${status.bg}`}>
                  <QRCodeSVG
                    value={qrContent}
                    size={fullscreen ? 320 : 240}
                    level="H"
                    includeMargin
                  />
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Referência
                </div>
                <div className="text-xl font-mono">{receipt.ref}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button variant="outline" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                <Button variant="outline" onClick={() => setFullscreen(!fullscreen)}>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Tela cheia
                </Button>
                <Button variant="outline" disabled>
                  <Sun className="w-4 h-4 mr-2" />
                  Brilho
                </Button>
              </div>
            </>
          )}

          {(receipt.status === 'confirmed' || receipt.status === 'settled') && (
            <div className="space-y-2 mb-4">
              <Button onClick={handleViewReceipt} className="w-full">
                Ver Comprovante
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Nova Cobrança
              </Button>
            </div>
          )}

          {receipt.status === 'error' && (
            <Button variant="outline" onClick={onClose} className="w-full">
              Tentar Novamente
            </Button>
          )}

          {flags?.demoMode && receipt.status === 'pending' && (
            <div className="space-y-2 pt-4 border-t">
              <div className="text-xs text-muted-foreground text-center mb-2">
                Controles de Desenvolvimento (demoMode: {String(flags.demoMode)})
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDevConfirm} 
                className="w-full"
              >
                Dev: Confirmar Pagamento
              </Button>
            </div>
          )}

          {flags?.demoMode && receipt.status === 'confirmed' && (
            <div className="space-y-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleDevSettle} className="w-full">
                Dev: Liquidar
              </Button>
            </div>
          )}

          {receipt.status === 'pending' && (
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full mt-4"
            >
              Cancelar
            </Button>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
