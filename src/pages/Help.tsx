import { HeaderBar } from '@/components/HeaderBar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n';
import { HelpCircle, BookOpen, Github, FileText } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Help() {
  const { t } = useTranslation();

  const faqs = [
    {
      q: 'O que é PIX-like?',
      a: 'PIX-like é um comprovante de pagamento baseado em blockchain que funciona de forma similar ao PIX, mas usando a blockchain Solana. Oferece prova on-chain da transação sem necessidade de liquidação bancária.',
    },
    {
      q: 'Como funciona a liquidação PIX?',
      a: 'Quando habilitada, a liquidação PIX converte automaticamente os pagamentos em crypto para reais em sua conta bancária. Este recurso estará disponível em breve através de nossos parceiros.',
    },
    {
      q: 'Os pagamentos são seguros?',
      a: 'Sim. Todas as transações são registradas na blockchain Solana, oferecendo transparência e segurança. Os pagamentos são irreversíveis e verificáveis publicamente.',
    },
    {
      q: 'Como funcionam os reembolsos?',
      a: 'Em modo PIX-like, reembolsos devem ser feitos manualmente enviando crypto de volta para o endereço do pagador. Com liquidação PIX habilitada, políticas de reembolso seguirão as regras bancárias padrão.',
    },
    {
      q: 'Posso exportar meus dados?',
      a: 'Sim, você pode exportar todas as suas transações em formato CSV através da página de Recibos. PDFs oficiais estarão disponíveis quando a liquidação PIX for habilitada.',
    },
    {
      q: 'O que é o modo Demo?',
      a: 'O modo Demo permite testar o sistema sem transações reais. Você pode simular confirmações e liquidações de pagamentos para entender o fluxo completo.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderBar showBack title={t('help.title')} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Perguntas Frequentes</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-bold">Sobre</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Versão</div>
              <div className="font-medium">1.0.0-demo</div>
            </div>

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground mb-2">Recursos</div>
              <div className="space-y-2">
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub (em breve)</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Documentação (em breve)</span>
                </a>
              </div>
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground">
              <div className="mb-2">
                <strong>Aviso Legal:</strong> Este é um sistema de demonstração.
                Não realize transações reais sem antes configurar integrações de
                produção adequadas.
              </div>
              <div>
                Desenvolvido com React, TypeScript, Tailwind CSS e shadcn/ui.
                Blockchain: Solana.
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 Merchant AI Checkout. Todos os direitos reservados.</p>
        </div>
      </main>
    </div>
  );
}
