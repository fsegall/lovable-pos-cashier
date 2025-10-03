import { HeaderBar } from '@/components/HeaderBar';
import { BottomTabs } from '@/components/BottomTabs';
import { Card } from '@/components/ui/card';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { DollarSign, Receipt as ReceiptIcon, TrendingUp, Percent } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const { t } = useTranslation();
  const receipts = useStore((state) => state.receipts);

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
