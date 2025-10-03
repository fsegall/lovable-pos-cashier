import { HeaderBar } from '@/components/HeaderBar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReceipts } from '@/hooks/useReceipts';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Webhook, Clock, CheckCircle, DollarSign, XCircle } from 'lucide-react';

export default function Webhooks() {
  const { t } = useTranslation();
  const { receipts } = useReceipts();
  const getWebhookEvents = useStore((state) => state.getWebhookEvents);

  const events = getWebhookEvents(receipts);

  const getEventIcon = (type: string) => {
    if (type.includes('pending')) return Clock;
    if (type.includes('confirmed')) return CheckCircle;
    if (type.includes('settled')) return DollarSign;
    if (type.includes('error')) return XCircle;
    return Webhook;
  };

  const getEventColor = (type: string) => {
    if (type.includes('pending')) return 'text-pending';
    if (type.includes('confirmed')) return 'text-success';
    if (type.includes('settled')) return 'text-accent';
    if (type.includes('error')) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderBar showBack title="Webhooks" />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Webhook className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <div className="font-medium mb-1">Eventos de Webhook</div>
              <div className="text-sm text-muted-foreground">
                Webhooks aparecerão aqui quando a integração estiver habilitada.
                Estes são eventos de demonstração baseados nas transações existentes.
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {events.map((event) => {
            const Icon = getEventIcon(event.type);
            const color = getEventColor(event.type);

            return (
              <Card key={event.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="bg-muted/50 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                </div>
              </Card>
            );
          })}
        </div>

        {events.length === 0 && (
          <Card className="p-12 text-center">
            <Webhook className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum evento de webhook ainda. Crie transações no POS para gerar eventos.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
