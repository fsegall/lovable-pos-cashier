import { HeaderBar } from '@/components/HeaderBar';
import { BottomTabs } from '@/components/BottomTabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useMerchant } from '@/hooks/useMerchant';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentAssistant } from '@/components/PaymentAssistant';
import { Globe, DollarSign, CheckCircle2, XCircle } from 'lucide-react';

export default function Settings() {
  const { t, lang, setLanguage } = useTranslation();
  const { merchant, flags, updateMerchant, updateFlags } = useMerchant();
  const staff = useStore((state) => state.staff);

  const [storeName, setStoreName] = useState(merchant?.name || '');
  const [category, setCategory] = useState(merchant?.category || '');

  const handleSave = () => {
    updateMerchant({ name: storeName, category });
    toast.success('Configurações salvas!');
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <HeaderBar title={t('settings.title')} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* AI Assistant */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">🤖 Assistente de Pagamentos</h3>
          <PaymentAssistant />
        </Card>

        {/* Store Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('settings.store')}</h3>
          <div className="space-y-4">
            <div>
              <Label>{t('settings.storeName')}</Label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div>
              <Label>{t('settings.category')}</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Café, Restaurante, etc."
              />
            </div>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </div>
        </Card>

        {/* Staff */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('settings.staff')}</h3>
          <div className="space-y-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{member.role}</Badge>
                  <Badge
                    variant={member.status === 'active' ? 'default' : 'outline'}
                  >
                    {member.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('settings.payments')}</h3>
          <div className="space-y-4">
            <div>
              <Label>{t('settings.wallet')}</Label>
              <Input value={merchant?.walletMasked || ''} disabled />
            </div>
          </div>
        </Card>

        {/* Feature Flags */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('settings.flags')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t('settings.pixLike')}</div>
                <div className="text-sm text-muted-foreground">
                  Comprovantes on-chain apenas
                </div>
              </div>
              <Switch
                checked={!flags?.pixSettlement}
                onCheckedChange={(checked) =>
                  updateFlags({ pixSettlement: !checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t('settings.pixSettlement')}</div>
                <div className="text-sm text-muted-foreground">
                  Liquidação automática em conta bancária
                </div>
              </div>
              <Switch
                checked={flags?.pixSettlement || false}
                onCheckedChange={(checked) =>
                  updateFlags({ pixSettlement: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t('settings.payWithBinance')}</div>
                <div className="text-sm text-muted-foreground">
                  Habilitar pagamento via Binance
                </div>
              </div>
              <Switch
                checked={flags?.payWithBinance || false}
                onCheckedChange={(checked) =>
                  updateFlags({ payWithBinance: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t('settings.useSmartContract')}</div>
                <div className="text-sm text-muted-foreground">
                  Usar programa Solana para transações
                </div>
              </div>
              <Switch
                checked={flags?.useProgram || false}
                onCheckedChange={(checked) => updateFlags({ useProgram: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Modo Demo</div>
                <div className="text-sm text-muted-foreground">
                  Controles de desenvolvimento
                </div>
              </div>
              <Switch
                checked={flags?.demoMode || false}
                onCheckedChange={(checked) => updateFlags({ demoMode: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Settlement Providers */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Settlement Providers
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure off-ramp providers to convert crypto to fiat (optional)
          </p>

          <Alert className="mb-4">
            <AlertDescription className="text-xs">
              💡 <strong>Cypherpunk by design:</strong> Settlement is optional. You can keep crypto
              or convert to fiat anytime via Circle (global) or Wise (50+ currencies).
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {/* Wise Provider */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Wise</div>
                    <div className="text-xs text-muted-foreground">
                      50+ currencies · Low fees · Global
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Not Configured
                </Badge>
              </div>
              
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>API Token:</span>
                  <span>Not set</span>
                </div>
                <div className="flex justify-between">
                  <span>Profile ID:</span>
                  <span>Not set</span>
                </div>
                <div className="flex justify-between">
                  <span>Supported:</span>
                  <span>BRL, USD, EUR, GBP, +46 more</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full mt-3" disabled>
                Configure Wise
              </Button>
            </div>

            {/* Circle Provider */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Circle</div>
                    <div className="text-xs text-muted-foreground">
                      USDC native · Enterprise · Global
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Not Configured
                </Badge>
              </div>
              
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>API Key:</span>
                  <span>Not set</span>
                </div>
                <div className="flex justify-between">
                  <span>Wallet ID:</span>
                  <span>Not set</span>
                </div>
                <div className="flex justify-between">
                  <span>Supported:</span>
                  <span>USD, EUR, GBP</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full mt-3" disabled>
                Configure Circle
              </Button>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                🔐 <strong>Security:</strong> API keys are stored securely in Supabase Edge Functions.
                They are never exposed to the client. Configure via environment variables or Supabase secrets.
              </AlertDescription>
            </Alert>
          </div>
        </Card>

        {/* Language & Theme */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('settings.language')}</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={lang === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
              >
                English
              </Button>
              <Button
                variant={lang === 'pt' ? 'default' : 'outline'}
                onClick={() => setLanguage('pt')}
              >
                Português
              </Button>
            </div>
          </div>
        </Card>
      </main>

      <BottomTabs />
    </div>
  );
}
