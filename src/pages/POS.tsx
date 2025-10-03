import { useState } from 'react';
import { HeaderBar } from '@/components/HeaderBar';
import { BottomTabs } from '@/components/BottomTabs';
import { MoneyKeypad } from '@/components/MoneyKeypad';
import { QRCodePanel } from '@/components/QRCodePanel';
import { Card } from '@/components/ui/card';
import { useStore } from '@/lib/store';
import { Receipt } from '@/types/store';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { StatusChip } from '@/components/StatusChip';

export default function POS() {
  const { t } = useTranslation();
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);
  const createCharge = useStore((state) => state.createCharge);
  const receipts = useStore((state) => state.receipts);

  const handleGenerate = (amount: number) => {
    const receipt = createCharge(amount);
    setCurrentReceipt(receipt);
  };

  const handleClose = () => {
    setCurrentReceipt(null);
  };

  const recentReceipts = receipts.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <HeaderBar title={t('pos.title')} showBack />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        {!currentReceipt ? (
          <>
            {recentReceipts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  Transações Recentes
                </h2>
                <div className="space-y-2">
                  {recentReceipts.map((receipt) => (
                    <Card
                      key={receipt.id}
                      className="p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold">
                          R$ {receipt.amountBRL.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {receipt.ref} • {new Date(receipt.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <StatusChip status={receipt.status} />
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            <Card className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold mb-2">
                  {t('pos.title')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('pos.enterAmount')}
                </p>
              </div>
              <MoneyKeypad onGenerate={handleGenerate} />
            </Card>
          </>
        ) : (
          <QRCodePanel receipt={currentReceipt} onClose={handleClose} />
        )}
      </main>

      <BottomTabs />
    </div>
  );
}
