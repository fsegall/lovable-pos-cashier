# 🏴‍☠️ Settlement Architecture - Cypherpunk by Design

> **Estratégia de settlement peer-to-peer com off-ramp opcional para o Merchant AI Checkout**

---

## 🎯 Filosofia: Crypto-Native com Fiat Opcional

**Princípio:** O sistema é **100% funcional sem bancos**. Fiat é apenas uma conveniência opcional.

---

## 🏗️ Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: PAGAMENTO (Solana Pay - Protocolo Aberto)         │
│ Cliente Wallet → Merchant Wallet (peer-to-peer direto)      │
│ ✅ Zero intermediário                                        │
│ ✅ Zero fees (só gas ~$0.0001)                              │
│ ✅ 100% on-chain                                            │
│ ✅ Já implementado!                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: AUTO-SWAP (Jupiter Aggregator - DeFi)             │
│ Aceita QUALQUER token SPL → converte para BRZ/USDC         │
│ ✅ Cliente paga em SOL/BONK/qualquer                        │
│ ✅ Merchant recebe stablecoin                               │
│ ✅ Best price aggregation                                   │
│ 🔄 Implementar Semana C                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: OFF-RAMP FIAT (Opcional - Somente se merchant quer)│
│                                                              │
│ Brasil:  BRZ → Wise/MercadoPago → PIX                       │
│ Global:  USDC → Circle → Bank Transfer (USD/EUR/GBP)        │
│                                                              │
│ ⚠️ OPCIONAL: Merchant pode manter crypto!                   │
│ 💰 Implementar Semana B                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Layer 1: Solana Pay (Protocolo)

### **O que é:**
- 📋 **Especificação aberta** (como HTTP, não um serviço)
- 🔗 URL scheme: `solana:pay?recipient=...&amount=...&reference=...`
- 🎫 QR code universal (qualquer wallet Solana entende)
- ⚡ Transação direta wallet-to-wallet

### **Analogia:**
- **Stellar:** SEP-24 (interactive deposit/withdrawal)
- **Bitcoin:** BIP-21 (payment URI)
- **Ethereum:** EIP-681 (payment request)

### **Status:** ✅ **Implementado!**

**Código:**
```typescript
// src/hooks/useSolanaPay.ts
const url = encodeURL({
  recipient: merchantWallet,
  amount: new BigNumber(amountBRL),
  reference: uniquePublicKey,
  splToken: brzMint, // ou usdcMint
});
```

---

## 🔀 Layer 2: Jupiter Aggregator (Auto-Swap)

### **O que é:**
- 🌊 **Agregador de liquidez** DEX
- 🔄 Roteamento inteligente entre pools
- 💎 Best price execution
- ⚡ Slippage protection

### **Por que usar:**
1. **Aceitar qualquer token** - Cliente paga em SOL/BONK/WIF/qualquer
2. **Merchant recebe stablecoin** - Sempre BRZ ou USDC
3. **Zero risco de preço** - Conversão instantânea
4. **Demonstra expertise DeFi** - Composability na prática

### **Status:** 🔄 **Roadmap Semana C**

**Implementação Planejada:**
```typescript
// src/lib/jupiter-swap.ts
import { Jupiter } from '@jup-ag/core';

async function swapToStablecoin(
  inputToken: PublicKey,  // SOL, BONK, etc
  amount: number,
  outputToken: PublicKey  // BRZ ou USDC
) {
  const jupiter = await Jupiter.load({
    connection,
    cluster: 'mainnet-beta',
    user: merchantWallet,
  });

  const routes = await jupiter.computeRoutes({
    inputMint: inputToken,
    outputMint: outputToken,
    amount,
    slippageBps: 50, // 0.5% slippage
  });

  const { execute } = await jupiter.exchange({ routeInfo: routes[0] });
  const txid = await execute();
  
  return txid;
}
```

**Fluxo:**
```
Cliente paga 0.5 SOL
  ↓
Jupiter: SOL → USDC (best route via Orca/Raydium/Phoenix)
  ↓
Merchant recebe ~$50 USDC
  ↓
Invoice marcada como "confirmed" com txid
```

---

## 💰 Layer 3: Off-Ramp Fiat (Opcional)

### **Estratégia Multi-Provider:**

```typescript
interface SettlementProvider {
  name: string;
  region: string[];
  currencies: string[];
  apiEndpoint: string;
  webhook: boolean;
}

const providers: SettlementProvider[] = [
  {
    name: 'circle',
    region: ['global'],
    currencies: ['USD', 'EUR', 'GBP'],
    apiEndpoint: 'https://api.circle.com/v1',
    webhook: true,
  },
  {
    name: 'wise',
    region: ['global'],
    currencies: ['BRL', 'USD', 'EUR', 'GBP', '50+'],
    apiEndpoint: 'https://api.wise.com/v1',
    webhook: true,
  },
  {
    name: 'mercadopago',
    region: ['BR', 'AR', 'MX'],
    currencies: ['BRL', 'ARS', 'MXN'],
    apiEndpoint: 'https://api.mercadopago.com/v1',
    webhook: true,
  },
];
```

---

### **🌍 Circle (USD Global) - RECOMENDADO**

**Por que escolher:**
- ✅ **USDC nativo** - eles são o issuer
- ✅ **Solana support** - USDC na Solana é oficial
- ✅ **API crypto-friendly** - feita para isso
- ✅ **Sandbox gratuito** - testar sem custos
- ✅ **Compliance** - KYC/AML built-in
- ✅ **150+ países**

**Endpoints Principais:**
```typescript
// 1. Receber notificação de pagamento USDC
POST /v1/notifications/subscriptions
{
  "endpoint": "https://your-app.com/webhooks/circle",
  "subscriptionDetails": [
    { "url": "payments", "status": "confirmed" }
  ]
}

// 2. Criar payout (USDC → Bank)
POST /v1/businessAccount/payouts
{
  "idempotencyKey": "uuid",
  "source": {
    "type": "wallet",
    "id": "merchant-wallet-id"
  },
  "destination": {
    "type": "wire",
    "name": "Merchant Name",
    "accountNumber": "123456789",
    "routingNumber": "021000021"
  },
  "amount": {
    "amount": "100.00",
    "currency": "USD"
  }
}

// 3. Webhook recebido
{
  "Type": "payout",
  "Action": "completed",
  "payout": {
    "id": "...",
    "status": "complete",
    "amount": "100.00"
  }
}
```

**Edge Function:**
```typescript
// supabase/functions/circle-payout/index.ts
serve(async (req) => {
  const { invoiceRef, amount } = await req.json();
  
  // 1. Verificar saldo USDC na wallet
  const balance = await getUSDCBalance(merchantWallet);
  if (balance < amount) throw new Error('Insufficient USDC');
  
  // 2. Criar payout na Circle
  const payout = await circleAPI.createPayout({
    amount: amount.toString(),
    currency: 'USD',
    destination: merchantBankAccount,
  });
  
  // 3. Registrar no banco
  await supabase.rpc('mark_settled', { 
    _ref: invoiceRef,
    _settlement_id: payout.id,
    _provider: 'circle'
  });
  
  return json({ ok: true, payoutId: payout.id });
});
```

---

### **🇧🇷 Wise (Multi-Currency) - SUA ESCOLHA**

**Por que escolher:**
- ✅ **50+ moedas** - incluindo BRL
- ✅ **Low fees** (0.5-1%)
- ✅ **API madura** - bem documentada
- ✅ **Sandbox disponível**
- ⚠️ **Não aceita crypto direto** - precisa converter antes

**Fluxo Wise:**
```
1. Merchant recebe BRZ/USDC na Solana wallet
2. [Manual ou via Exchange API] Vende crypto → USD/BRL
3. Deposita na conta Wise (balance)
4. Wise API: transfer para conta bancária final
```

**Edge Function (Wise):**
```typescript
// supabase/functions/wise-payout/index.ts
serve(async (req) => {
  const { invoiceRef, amount, currency, recipientId } = await req.json();
  
  // 1. Criar quote
  const quote = await wiseAPI.createQuote({
    sourceCurrency: currency, // 'BRL' ou 'USD'
    targetCurrency: currency,
    sourceAmount: amount,
  });
  
  // 2. Criar transfer
  const transfer = await wiseAPI.createTransfer({
    targetAccount: recipientId,
    quoteUuid: quote.id,
    customerTransactionId: invoiceRef,
  });
  
  // 3. Fund transfer (do balance Wise)
  await wiseAPI.fundTransfer(transfer.id);
  
  // 4. Registrar settlement
  await supabase.rpc('mark_settled', {
    _ref: invoiceRef,
    _settlement_id: transfer.id,
    _provider: 'wise'
  });
  
  return json({ ok: true, transferId: transfer.id });
});

// Webhook handler
serve(async (req) => {
  const signature = req.headers.get('X-Signature');
  const payload = await req.text();
  
  // Validar HMAC
  if (!validateWiseSignature(payload, signature)) {
    return json({ error: 'Invalid signature' }, 401);
  }
  
  const event = JSON.parse(payload);
  
  if (event.data.resource.type === 'transfer' && 
      event.data.current_state === 'outgoing_payment_sent') {
    
    await supabase.rpc('mark_settled', {
      _ref: event.data.resource.customer_transaction_id,
      _settlement_id: event.data.resource.id,
      _provider: 'wise'
    });
  }
  
  return json({ ok: true });
});
```

---

### **🇧🇷 MercadoPago (Brasil Alternativa)**

**Por que considerar:**
- ✅ **Mais fácil** que Transfero (API pública)
- ✅ **PIX nativo**
- ✅ **Sandbox gratuito**
- ✅ **Documentação em PT-BR**
- ❌ Só LatAm (BR, AR, MX)

**Endpoints:**
```typescript
// Criar PIX payment
POST https://api.mercadopago.com/v1/payments
{
  "transaction_amount": 100.00,
  "description": "Settlement invoice REF123",
  "payment_method_id": "pix",
  "payer": {
    "email": "merchant@example.com",
    "identification": {
      "type": "CPF",
      "number": "12345678900"
    }
  }
}

// Webhook
POST /webhooks/mercadopago
{
  "action": "payment.updated",
  "data": {
    "id": "payment-id"
  }
}
```

---

## 🎯 **Recomendação Final para MVP (Semana B)**

### **Implementar 2 Providers:**

#### **1. Circle (Global - USD/EUR/GBP)**
```typescript
// Para merchants fora do Brasil
USDC (Solana) → Circle API → Bank Transfer
```

**Benefícios:**
- ✅ Crypto-native (USDC é deles)
- ✅ Sandbox fácil
- ✅ Impressiona juízes internacionais
- ✅ Enterprise-grade

#### **2. Wise (Multi-Currency - incluindo BRL)**
```typescript
// Para merchants globais (50+ moedas)
BRZ/USDC → [Manual: vende em exchange] → Wise Balance → Bank Transfer
```

**Benefícios:**
- ✅ Você já tem a spec da API
- ✅ ChatGPT já adiantou o código
- ✅ Funciona no Brasil E no mundo
- ✅ Low fees (0.5-1%)

---

## 📋 **Abstração de Settlement Provider**

### **Interface Unificada:**

```typescript
// src/lib/settlement/types.ts
export interface SettlementProvider {
  name: 'circle' | 'wise' | 'mercadopago';
  region: string[];
  currencies: string[];
  
  // Métodos obrigatórios
  createPayout(params: PayoutParams): Promise<PayoutResult>;
  getPayoutStatus(id: string): Promise<PayoutStatus>;
  validateWebhook(req: Request): Promise<WebhookEvent>;
}

export interface PayoutParams {
  invoiceRef: string;
  amount: number;
  currency: string;
  recipientId: string;
  metadata?: Record<string, any>;
}

export interface PayoutResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedArrival?: Date;
  fee?: number;
}
```

### **Implementações:**

```typescript
// src/lib/settlement/circle.ts
export class CircleProvider implements SettlementProvider {
  name = 'circle' as const;
  region = ['global'];
  currencies = ['USD', 'EUR', 'GBP'];
  
  async createPayout(params: PayoutParams) {
    const response = await fetch('https://api.circle.com/v1/businessAccount/payouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CIRCLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotencyKey: params.invoiceRef,
        amount: { amount: params.amount.toFixed(2), currency: params.currency },
        destination: { type: 'wire', id: params.recipientId },
      }),
    });
    
    const data = await response.json();
    return {
      id: data.data.id,
      status: data.data.status,
      estimatedArrival: new Date(data.data.createDate),
    };
  }
  
  async validateWebhook(req: Request) {
    // Circle webhook validation
    const signature = req.headers.get('X-Circle-Signature');
    const payload = await req.text();
    // ... HMAC validation
    return JSON.parse(payload);
  }
}

// src/lib/settlement/wise.ts
export class WiseProvider implements SettlementProvider {
  name = 'wise' as const;
  region = ['global'];
  currencies = ['BRL', 'USD', 'EUR', 'GBP', /* +46 mais */];
  
  async createPayout(params: PayoutParams) {
    // 1. Create quote
    const quote = await wiseAPI.createQuote({
      sourceCurrency: params.currency,
      targetCurrency: params.currency,
      sourceAmount: params.amount,
    });
    
    // 2. Create transfer
    const transfer = await wiseAPI.createTransfer({
      targetAccount: params.recipientId,
      quoteUuid: quote.id,
      customerTransactionId: params.invoiceRef,
    });
    
    // 3. Fund transfer
    await wiseAPI.fundTransfer(transfer.id);
    
    return {
      id: transfer.id,
      status: 'processing',
      estimatedArrival: new Date(transfer.estimatedDelivery),
    };
  }
  
  async validateWebhook(req: Request) {
    // Wise webhook validation (HMAC)
    const signature = req.headers.get('X-Signature');
    const payload = await req.text();
    // ... HMAC validation
    return JSON.parse(payload);
  }
}
```

### **Provider Factory:**

```typescript
// src/lib/settlement/factory.ts
export function getSettlementProvider(
  currency: string,
  region?: string
): SettlementProvider {
  // Auto-select based on currency
  if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
    return new CircleProvider();
  }
  
  if (currency === 'BRL') {
    return new WiseProvider(); // ou MercadoPagoProvider
  }
  
  // Default: Wise (suporta tudo)
  return new WiseProvider();
}
```

---

## 🎬 **Pitch Cypherpunk para Juízes**

### **Slide 1: O Problema**
*"Pagamentos tradicionais têm 3 intermediários: processador, banco emissor, banco receptor. Cada um cobra 1-3%. Total: até 9% de fees + 2-30 dias para liquidar."*

### **Slide 2: Nossa Solução**
*"Nosso sistema é **peer-to-peer puro**:*

1. **Pagamento:** Solana Pay (protocolo aberto, zero intermediário)
2. **Multi-token:** Jupiter (aceita qualquer SPL, converte on-chain)
3. **Off-ramp:** Opcional via Circle/Wise (só se merchant quiser fiat)

*Nenhuma dependência bancária obrigatória. Pure cypherpunk."* 🏴‍☠️

### **Slide 3: Diferencial Técnico**
```
Outros projetos:     Cliente → PSP → Blockchain → PSP → Merchant
Nosso projeto:       Cliente → Blockchain → Merchant
                                    ↓ (opcional)
                                  Circle/Wise
```

*"Removemos 2 intermediários. Resultado: 99% menos fees, 100x mais rápido."*

---

## 📊 **Comparativo de Fees**

| Método | Intermediários | Fee Total | Tempo |
|--------|---------------|-----------|-------|
| **Cartão de Crédito** | 3-4 | 3-5% | 2-30 dias |
| **PIX via PSP** | 2 | 1-2% | 1-2 dias |
| **Solana Pay + Circle** | 1 (opcional) | 0.5-1% | < 1 dia |
| **Solana Pay puro** | 0 | $0.0001 | < 10s |

---

## 🗓️ **Roadmap de Implementação**

### **Semana B (8-14 OUT):**
- [x] Documentar arquitetura ✅ (este arquivo)
- [ ] Implementar Circle provider
  - [ ] Edge Function `circle-payout`
  - [ ] Webhook handler
  - [ ] Sandbox testing
- [ ] Implementar Wise provider
  - [ ] Edge Function `wise-payout`
  - [ ] Webhook handler
  - [ ] Sandbox testing
- [ ] UI: botão "Settle to Bank" (opcional)
- [ ] Dashboard: mostrar settled vs crypto balance

### **Semana C (15-20 OUT):**
- [ ] Implementar Jupiter auto-swap
  - [ ] Hook `useJupiterSwap`
  - [ ] UI: "Accept any token"
  - [ ] Slippage configuration
- [ ] Testing end-to-end
- [ ] Performance optimization

---

## 🏆 **Por que isso ganha o Hackathon**

### **1. Inovação Técnica**
- ✨ Primeiro POS com Jupiter integration
- ✨ Multi-provider settlement abstraction
- ✨ Voice-controlled crypto payments

### **2. Cypherpunk Values**
- 🏴‍☠️ Peer-to-peer por padrão
- 🏴‍☠️ Fiat opcional, não obrigatório
- 🏴‍☠️ Open source, self-hostable
- 🏴‍☠️ Zero dependência de bancos

### **3. Market Fit**
- 🌍 Funciona globalmente (Circle)
- 🇧🇷 Funciona no Brasil (Wise/MercadoPago)
- 💼 Prático para merchants reais
- 📱 UX familiar (PIX-like)

### **4. Ecosystem Impact**
- 🪙 Aumenta uso de USDC/BRZ na Solana
- 🔄 Demonstra composability (Jupiter + Solana Pay)
- 👥 Onboarding de merchants para Web3
- 📚 Código open source para comunidade

---

## 💬 **Frase de Impacto (Use no Pitch)**

*"Nosso sistema é cypherpunk por design:*

- *O pagamento é **peer-to-peer** via Solana Pay*
- *A conversão é **on-chain**, feita pela Jupiter*
- *E o off-ramp fiat é apenas **opcional**, via Circle ou Wise*

*Nenhuma dependência bancária — apenas contratos abertos e liquidez pública."* 

**🏴‍☠️⚡**

---

## 🔗 **Links Úteis**

### **Circle**
- 📖 Docs: https://developers.circle.com/
- 🧪 Sandbox: https://app-sandbox.circle.com/
- 🔑 API Keys: https://app-sandbox.circle.com/settings/api

### **Wise**
- 📖 Docs: https://docs.wise.com/api-docs/
- 🧪 Sandbox: https://sandbox.transferwise.tech/
- 🔑 API Keys: https://sandbox.transferwise.tech/settings/api-tokens

### **Jupiter**
- 📖 Docs: https://station.jup.ag/docs/apis/swap-api
- 💻 SDK: https://github.com/jup-ag/jupiter-core
- 🎮 Playground: https://jup.ag/

### **Solana Pay**
- 📖 Spec: https://docs.solanapay.com/
- 💻 SDK: https://github.com/solana-labs/solana-pay
- 🎮 Examples: https://github.com/solana-labs/solana-pay/tree/master/examples

---

**🌟 Documentação completa! Amanhã implementamos! Boa noite!** 🚀
