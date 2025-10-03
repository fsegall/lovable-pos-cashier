import { HeaderBar } from '@/components/HeaderBar';
import { BottomTabs } from '@/components/BottomTabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function Settings() {
  const { t, lang, setLanguage } = useTranslation();
  const merchant = useStore((state) => state.merchant);
  const flags = useStore((state) => state.flags);
  const staff = useStore((state) => state.staff);
  const updateMerchant = useStore((state) => state.updateMerchant);
  const updateFlags = useStore((state) => state.updateFlags);

  const [storeName, setStoreName] = useState(merchant.name);
  const [category, setCategory] = useState(merchant.category || '');

  const handleSave = () => {
    updateMerchant({ name: storeName, category });
    toast.success('Configurações salvas!');
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <HeaderBar title={t('settings.title')} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl space-y-6">
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
              <Input value={merchant.walletMasked} disabled />
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
                checked={!flags.pixSettlement}
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
                checked={flags.pixSettlement}
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
                checked={flags.payWithBinance}
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
                checked={flags.useProgram}
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
                checked={flags.demoMode}
                onCheckedChange={(checked) => updateFlags({ demoMode: checked })}
              />
            </div>
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
