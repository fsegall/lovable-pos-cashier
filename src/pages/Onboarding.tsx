import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const updateMerchant = useStore((state) => state.updateMerchant);
  const updateFlags = useStore((state) => state.updateFlags);
  const completeOnboarding = useStore((state) => state.completeOnboarding);

  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wallet, setWallet] = useState('');
  const [pixSettlement, setPixSettlement] = useState(false);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step === 1 && !storeName) {
      toast.error('Digite o nome da loja');
      return;
    }
    if (step === 2 && (!ownerName || !email)) {
      toast.error('Preencha nome e email');
      return;
    }
    if (step === 4 && !wallet) {
      toast.error('Digite o endereço da carteira');
      return;
    }

    if (step === totalSteps) {
      updateMerchant({
        name: storeName,
        category,
        email,
        phone,
        walletMasked: wallet.slice(0, 4) + '...' + wallet.slice(-4),
      });
      updateFlags({ pixSettlement });
      completeOnboarding();
      toast.success('Configuração completa!');
      navigate('/pos');
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Nome da Loja *</Label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Minha Loja"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Café, Restaurante, etc."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Nome do Proprietário *</Label>
              <Input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="João Silva"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@example.com"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 98765-4321"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="font-semibold mb-1">PIX-like apenas</div>
                <div className="text-sm text-muted-foreground">
                  Comprovantes on-chain sem liquidação bancária
                </div>
              </div>
              <Switch
                checked={!pixSettlement}
                onCheckedChange={(checked) => setPixSettlement(!checked)}
              />
            </div>

            <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="font-semibold mb-1">Liquidação PIX</div>
                <div className="text-sm text-muted-foreground">
                  Liquidação automática em conta bancária (em breve)
                </div>
              </div>
              <Switch
                checked={pixSettlement}
                onCheckedChange={setPixSettlement}
              />
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-primary/5 rounded">
              <strong>Nota:</strong> A liquidação PIX permite converter automaticamente
              os pagamentos crypto para reais em sua conta bancária.
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Carteira de Recebimento *</Label>
              <Input
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="HG7x...2Kp9"
                className="font-mono"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Endereço da carteira Solana onde os pagamentos serão recebidos
              </div>
            </div>

            <Button variant="link" size="sm" className="px-0">
              O que é isso? →
            </Button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Revisão</h3>
              <p className="text-muted-foreground">
                Confirme suas informações antes de finalizar
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded bg-muted/50">
                <span className="text-muted-foreground">Loja</span>
                <span className="font-medium">{storeName}</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-muted/50">
                <span className="text-muted-foreground">Categoria</span>
                <span className="font-medium">{category || '-'}</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-muted/50">
                <span className="text-muted-foreground">Proprietário</span>
                <span className="font-medium">{ownerName}</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-muted/50">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-muted/50">
                <span className="text-muted-foreground">Liquidação</span>
                <span className="font-medium">
                  {pixSettlement ? 'PIX habilitado' : 'PIX-like'}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded bg-muted/50">
                <span className="text-muted-foreground">Carteira</span>
                <span className="font-medium font-mono text-sm">
                  {wallet.slice(0, 6)}...{wallet.slice(-6)}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    'Informações da Loja',
    'Dados do Proprietário',
    'Opções de Liquidação',
    'Carteira de Recebimento',
    'Revisão',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Card className="w-full max-w-lg p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Passo {step} de {totalSteps}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6">{stepTitles[step - 1]}</h2>
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1">
            {step === totalSteps ? 'Finalizar' : 'Próximo'}
            {step < totalSteps && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
