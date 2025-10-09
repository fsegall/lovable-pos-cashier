import { useState, useEffect } from 'react';
import { HeaderBar } from '@/components/HeaderBar';
import { BottomTabs } from '@/components/BottomTabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReceipts } from '@/hooks/useReceipts';
import { useSettlements } from '@/hooks/useSettlements';
import { useTranslation } from '@/lib/i18n';
import { DollarSign, Receipt as ReceiptIcon, TrendingUp, Percent, Wallet, ArrowRightLeft, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const { t } = useTranslation();
  const { receipts } = useReceipts();
  const { getSummary } = useSettlements();
  const [settlementSummary, setSettlementSummary] = useState<any>(null);

  // Fetch settlement summary on mount
  useEffect(() => {
    getSummary().then((summary) => {
      if (summary) {
        setSettlementSummary(summary);
      }
    });
  }, [getSummary]);

  const confirmedReceipts = receipts.filter((r) => r.status === 'confirmed' || r.status === 'settled');
  const settledReceipts = receipts.filter((r) => r.status === 'settled');

  const total = confirmedReceipts.reduce((sum, r) => sum + r.amountBRL, 0);
  const avgTicket = confirmedReceipts.length > 0 ? total / confirmedReceipts.length : 0;
  const settledPercent = receipts.length > 0 ? (settledReceipts.length / receipts.length) * 100 : 0;

  // Generate chart data (dummy daily data)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      amount: Math.random() * 500 + 100,
      count: Math.floor(Math.random() * 10) + 1,
    };
  });

  const stats = [
    {
      icon: DollarSign,
      label: t('reports.total'),
      value: `R$ ${total.toFixed(2)}`,
      color: 'text-primary',
    },
    {
      icon: ReceiptIcon,
      label: t('reports.transactions'),
      value: receipts.length.toString(),
      color: 'text-accent',
    },
    {
      icon: TrendingUp,
      label: t('reports.avgTicket'),
      value: `R$ ${avgTicket.toFixed(2)}`,
      color: 'text-success',
    },
    {
      icon: Percent,
      label: t('reports.settled'),
      value: `${settledPercent.toFixed(1)}%`,
      color: 'text-warning',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <HeaderBar title={t('reports.title')} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        {/* Main Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Settlement Stats */}
        {settlementSummary && (
          <>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Settlement Analytics
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Crypto Balance */}
              <Card className="p-6 border-blue-500/50 bg-blue-50 dark:bg-blue-900/10">
                <div className="flex items-center justify-between mb-2">
                  <Wallet className="w-8 h-8 text-blue-600" />
                  <Badge variant="secondary">Holding</Badge>
                </div>
                <div className="text-2xl font-bold mb-1">
                  R$ {settlementSummary.cryptoBalanceBRL?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Crypto Balance ({settlementSummary.holdingCrypto || 0} payments)
                </div>
              </Card>

              {/* Settled to Fiat */}
              <Card className="p-6 border-green-500/50 bg-green-50 dark:bg-green-900/10">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <Badge variant="secondary">Settled</Badge>
                </div>
                <div className="text-2xl font-bold mb-1">
                  R$ {settlementSummary.settledTotal?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Settled to Bank ({settlementSummary.settledCount || 0} payments)
                </div>
              </Card>

              {/* Performance */}
              <Card className="p-6 border-purple-500/50 bg-purple-50 dark:bg-purple-900/10">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <Badge variant="secondary">
                    {settlementSummary.settlementSuccessRate?.toFixed(0) || 0}% Success
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {settlementSummary.avgSettlementSeconds 
                    ? `${Math.round(settlementSummary.avgSettlementSeconds / 60)}m`
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg Settlement Time
                </div>
              </Card>
            </div>
          </>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('reports.daily')}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('reports.count')}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--accent))"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>

      <BottomTabs />
    </div>
  );
}
