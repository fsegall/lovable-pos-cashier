import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeaderBar } from '@/components/HeaderBar';
import { BottomTabs } from '@/components/BottomTabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusChip } from '@/components/StatusChip';
import { useReceipts } from '@/hooks/useReceipts';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Search, Download, FileText } from 'lucide-react';
import { ReceiptStatus } from '@/types/store';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Receipts() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<ReceiptStatus | 'all'>('all');
  const { receipts, refetch } = useReceipts();
  const exportCsv = useStore((state) => state.exportCsv);

  // Realtime: assinar invoices e payments para atualizar lista automaticamente
  useEffect(() => {
    const channel = supabase
      .channel('receipts-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
        },
        () => {
          console.log('Invoices updated, refetching...');
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          console.log('Payments updated, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleExport = () => {
    toast.info('Disponível após integração');
  };

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.ref.toLowerCase().includes(search.toLowerCase()) ||
      receipt.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    
    const now = Date.now();
    const receiptDate = new Date(receipt.createdAt).getTime();
    const matchesDate =
      dateFilter === 'all' ||
      (dateFilter === 'today' && now - receiptDate < 86400000) ||
      (dateFilter === '7d' && now - receiptDate < 604800000) ||
      (dateFilter === '30d' && now - receiptDate < 2592000000);

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <HeaderBar title={t('receipts.title')} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('receipts.filter.all')}</SelectItem>
              <SelectItem value="today">{t('receipts.filter.today')}</SelectItem>
              <SelectItem value="7d">{t('receipts.filter.7d')}</SelectItem>
              <SelectItem value="30d">{t('receipts.filter.30d')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('receipts.filter.all')}</SelectItem>
              <SelectItem value="pending">{t('receipts.filter.pending')}</SelectItem>
              <SelectItem value="confirmed">{t('receipts.filter.confirmed')}</SelectItem>
              <SelectItem value="settled">{t('receipts.filter.settled')}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport} disabled>
            <Download className="w-4 h-4 mr-2" />
            {t('receipts.exportCsv')}
          </Button>
        </div>

        {filteredReceipts.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t('receipts.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredReceipts.map((receipt) => (
              <Link key={receipt.id} to={`/receipts/${receipt.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold">
                          R$ {receipt.amountBRL.toFixed(2)}
                        </span>
                        <StatusChip status={receipt.status} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {receipt.ref}
                        {receipt.txHash && ` • ${receipt.txHash}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(receipt.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomTabs />
    </div>
  );
}
