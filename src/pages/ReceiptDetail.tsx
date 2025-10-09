import { useParams, useNavigate } from 'react-router-dom';
import { HeaderBar } from '@/components/HeaderBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusChip } from '@/components/StatusChip';
import { SettlementPanel } from '@/components/SettlementPanel';
import { useReceipts } from '@/hooks/useReceipts';
import { useMerchant } from '@/hooks/useMerchant';
import { useTranslation } from '@/lib/i18n';
import { Share2, Printer, FileDown, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export default function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { receipts } = useReceipts();
  const { merchant, flags } = useMerchant();

  const receipt = receipts.find((r) => r.id === id);

  if (!receipt) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderBar showBack title="Recibo não encontrado" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Este recibo não existe.</p>
            <Button onClick={() => navigate('/receipts')}>Voltar para Recibos</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Comprovante de Pagamento',
        text: `Pagamento de R$ ${receipt.amountBRL.toFixed(2)} confirmado`,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderBar showBack title={t('receipts.detail.title')} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        <Card className="p-6 mb-4 print:shadow-none">
          <div className="text-center mb-6">
            <div className="text-sm text-muted-foreground mb-2">
              {merchant?.name || 'Loja'}
            </div>
            <div className="text-4xl font-bold mb-2">
              R$ {receipt.amountBRL.toFixed(2)}
            </div>
            <StatusChip status={receipt.status} />
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('receipts.detail.date')}</span>
              <span className="font-medium">
                {new Date(receipt.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('receipts.detail.ref')}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{receipt.ref}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(receipt.ref)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {receipt.txHash && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('receipts.detail.txHash')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{receipt.txHash}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(receipt.txHash!)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('common.status')}</span>
              <StatusChip status={receipt.status} />
            </div>
          </div>

          {receipt.status === 'confirmed' || receipt.status === 'settled' ? (
            <>
              <Separator className="my-6" />
              <div className="flex justify-center">
                <div className="p-4 bg-muted rounded-xl">
                  <QRCodeSVG
                    value={`https://solscan.io/tx/${receipt.txHash}`}
                    size={160}
                    level="H"
                  />
                </div>
              </div>
            </>
          ) : null}

          <Separator className="my-6" />

          <div className="text-xs text-muted-foreground text-center">
            {t('receipts.detail.pixLike')}
          </div>
        </Card>

        {/* Settlement Panel - convert crypto to fiat */}
        <SettlementPanel receipt={receipt} onSettled={() => window.location.reload()} />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print:hidden">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            {t('receipts.detail.share')}
          </Button>

          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            {t('receipts.detail.print')}
          </Button>

          <Button
            variant="outline"
            disabled
            className="col-span-2 md:col-span-1"
            title={t('receipts.detail.pdfDisabled')}
          >
            <FileDown className="w-4 h-4 mr-2" />
            PDF PIX
          </Button>
        </div>
      </main>
    </div>
  );
}
