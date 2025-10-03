import { useState, useEffect } from 'react';
import { HeaderBar } from '@/components/HeaderBar';
import { BottomTabs } from '@/components/BottomTabs';
import { MoneyKeypad } from '@/components/MoneyKeypad';
import { QRCodePanel } from '@/components/QRCodePanel';
import { Card } from '@/components/ui/card';
import { useReceipts } from '@/hooks/useReceipts';
import { Receipt } from '@/types/store';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { StatusChip } from '@/components/StatusChip';
import { supabase } from '@/integrations/supabase/client';

export default function POS() {
  const { t } = useTranslation();
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);
  const { receipts, createCharge, refetch } = useReceipts();

  // Realtime: assinar invoices e payments para atualizar automaticamente
  useEffect(() => {
    if (!currentReceipt) return;

    const channel = supabase
      .channel(`pos-${currentReceipt.ref}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `ref=eq.${currentReceipt.ref}`,
        },
        () => {
          console.log('Invoice updated, refetching...');
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `invoice_id=eq.${currentReceipt.id}`,
        },
        () => {
          console.log('Payment updated, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentReceipt, refetch]);

  // Sincroniza currentReceipt com receipts atualizados
  useEffect(() => {
    if (currentReceipt) {
      const updatedReceipt = receipts.find(r => r.ref === currentReceipt.ref);
      if (updatedReceipt) {
        console.log('Current receipt status:', currentReceipt.status);
        console.log('Updated receipt status:', updatedReceipt.status);
        if (JSON.stringify(updatedReceipt) !== JSON.stringify(currentReceipt)) {
          console.log('Updating currentReceipt with new data');
          setCurrentReceipt(updatedReceipt);
        }
      }
    }
  }, [receipts, currentReceipt]);

  const handleGenerate = async (amount: number) => {
    const receipt = await createCharge(amount);
    if (receipt) {
      setCurrentReceipt(receipt);
    }
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
