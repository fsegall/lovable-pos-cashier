# 📅 Daily Checklist - 8 OUT 2025
## 🎯 Objetivo: Settlement Providers - Day 2

> **Meta:** Implementar off-ramp fiat opcional com Circle (USD global) e Wise (BRL + multi-currency), mantendo o core crypto-native.

---

## 🌅 Contexto do Dia

**Ontem (Day 1):** ✅ Solana Pay + Wallet Adapter + Demo Mode funcionando  
**Hoje (Day 2):** 🔄 Settlement providers + Validação on-chain real  
**Amanhã (Day 3):** 🚀 Jupiter multi-token + Polish

**Progresso:** 85% → 90% (meta do dia)

### 🎛️ Feature Flags (Adicionar ao .env)
```bash
# Feature toggles
FEATURE_OFFRAMP_CIRCLE=true
FEATURE_OFFRAMP_WISE=true
FEATURE_JUPITER_SWAP=false  # Day 3
FEATURE_ONCHAIN_VALIDATION=true  # Hoje mudamos de false para true
```

---

## 🎯 Estratégia Cypherpunk

**Core (sem fiat):**
- ✅ Solana Pay peer-to-peer (já funciona)
- ✅ Merchant recebe BRZ/USDC direto
- ✅ Zero intermediário

**Opcional (off-ramp):**
- 🔄 Circle: USDC → USD bank transfer (global)
- 🔄 Wise: BRZ/USD → bank transfer (50+ moedas)
- 🎯 Merchant escolhe: manter crypto OU converter para fiat

---

## 📦 Fase 1: Validação On-Chain Real (2-3h)

### Objetivo
Substituir DEMO_MODE por validação real de transações Solana usando `@solana/pay`.

### Tasks

#### 1.1 Implementar @solana/pay no Deno
- [ ] Testar import de `@solana/pay` no Deno
  ```typescript
  import { findReference, validateTransfer } from "npm:@solana/pay@0.2.5";
  ```
- [ ] Se não funcionar, usar `@solana/web3.js` direto
- [ ] Criar helper `findTransactionByReference()`

#### 1.2 Atualizar validate-payment Edge Function
- [ ] Remover lógica DEMO_MODE
- [ ] Implementar `findReference()` para buscar tx
- [ ] Implementar `validateTransfer()` para verificar:
  - [ ] Recipient correto (merchant wallet)
  - [ ] Amount correto (com decimals do token)
  - [ ] SPL Token correto (BRZ mint)
  - [ ] Reference correta (PublicKey)
- [ ] Commitment level: `confirmed` (ou `finalized` para prod)

#### 1.3 Error Handling
- [ ] Transação não encontrada → retornar `{ status: 'pending' }`
- [ ] Transação inválida → retornar `{ status: 'error', reason: '...' }`
- [ ] Network timeout → retry com backoff
- [ ] Log detalhado para debugging

**DoD:** Pagamento real no devnet confirma automaticamente em < 10s

**Commits:**
- `feat: implement real on-chain validation with @solana/pay`
- `fix: handle edge cases in payment validation`

---

## 🏦 Fase 2: Circle Provider (USD Global) (2-3h)

### Objetivo
Implementar off-ramp USDC → USD via Circle para merchants globais.

### Tasks

#### 2.1 Setup Circle Sandbox
- [ ] Criar conta: https://app-sandbox.circle.com/
- [ ] Gerar API key (sandbox)
- [ ] Adicionar ao `supabase/functions/.env`:
  ```bash
  CIRCLE_API_KEY=TEST_API_KEY:...
  CIRCLE_ENVIRONMENT=sandbox
  ```
- [ ] Testar autenticação

#### 2.2 Criar Circle Provider Class
- [ ] Criar `src/lib/settlement/circle.ts`
  - [ ] Implementar `SettlementProvider` interface
  - [ ] `createPayout()` - USDC → bank transfer
  - [ ] `getPayoutStatus()` - consultar status
  - [ ] `validateWebhook()` - HMAC validation

#### 2.3 Edge Function: circle-payout
- [ ] Criar `supabase/functions/circle-payout/index.ts`
  - [ ] Receber: `{ invoiceRef, amount, currency, recipientId }`
  - [ ] Validar saldo USDC na wallet
  - [ ] Criar payout na Circle
  - [ ] Registrar no banco: `mark_settled()`
  - [ ] Retornar: `{ payoutId, status, estimatedArrival }`

#### 2.4 Webhook Handler: circle-webhook
- [ ] Criar `supabase/functions/circle-webhook/index.ts`
  - [ ] Validar signature (HMAC)
  - [ ] Parse event type
  - [ ] Atualizar status no banco
  - [ ] Log evento em `webhook_events` table

#### 2.5 UI Integration
- [ ] Adicionar botão "Settle to Bank (USD)" no receipt detail
- [ ] Modal para configurar bank account (one-time)
- [ ] Mostrar status: `pending → processing → completed`
- [ ] Exibir estimated arrival time

**DoD:** USDC → USD bank transfer funcionando no sandbox

**Commits:**
- `feat: add Circle settlement provider for USD off-ramp`
- `feat: implement Circle webhook handler`

---

## 💱 Fase 3: Wise Provider (Multi-Currency) (2-3h)

### Objetivo
Implementar off-ramp multi-currency (BRL, USD, EUR, etc) via Wise.

### Tasks

#### 3.1 Setup Wise Sandbox
- [ ] Criar conta: https://sandbox.transferwise.tech/
- [ ] Gerar API token (sandbox)
- [ ] Adicionar ao `supabase/functions/.env`:
  ```bash
  WISE_API_KEY=...
  WISE_ENVIRONMENT=sandbox
  WISE_PROFILE_ID=...
  ```
- [ ] Testar autenticação

#### 3.2 Criar Wise Provider Class
- [ ] Criar `src/lib/settlement/wise.ts`
  - [ ] Implementar `SettlementProvider` interface
  - [ ] `createQuote()` - calcular fees
  - [ ] `createTransfer()` - iniciar transfer
  - [ ] `fundTransfer()` - executar do balance
  - [ ] `validateWebhook()` - HMAC validation

#### 3.3 Edge Function: wise-payout
- [ ] Criar `supabase/functions/wise-payout/index.ts`
  - [ ] Receber: `{ invoiceRef, amount, currency, recipientId }`
  - [ ] Criar quote na Wise
  - [ ] Criar transfer
  - [ ] Fund transfer (do balance Wise)
  - [ ] Registrar settlement
  - [ ] Retornar: `{ transferId, status, fee, estimatedArrival }`

#### 3.4 Webhook Handler: wise-webhook
- [ ] Criar `supabase/functions/wise-webhook/index.ts`
  - [ ] Validar signature (X-Signature header)
  - [ ] Parse transfer state changes
  - [ ] Atualizar banco quando `outgoing_payment_sent`
  - [ ] Log eventos

#### 3.5 UI Integration
- [ ] Botão "Settle to Bank (Multi-Currency)"
- [ ] Dropdown para selecionar moeda (BRL, USD, EUR, etc)
- [ ] Mostrar quote (amount + fees) antes de confirmar
- [ ] Status tracking

**DoD:** BRZ/USDC → BRL/USD/EUR funcionando no sandbox

**Commits:**
- `feat: add Wise settlement provider for multi-currency off-ramp`
- `feat: implement Wise webhook handler with HMAC validation`

---

## 🗃️ Fase 4: Database Schema Updates (1h)

### Objetivo
Adicionar suporte para múltiplos settlement providers no banco com telemetria.

### Tasks

#### 4.1 Migration: Settlement Tracking
- [ ] Criar migration `add_settlement_tracking`
  ```sql
  -- Add settlement columns to payments table
  ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
    settlement_provider text check (settlement_provider in ('none', 'circle', 'wise', 'mercadopago'));
  
  ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
    settlement_id text;
  
  ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
    settlement_currency text;
  
  ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
    settlement_amount numeric(10,2);
  
  ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
    settlement_fee numeric(10,2);
  
  ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
    settlement_requested_at timestamptz;
  
  ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
    settlement_completed_at timestamptz;
  
  -- Create webhook_events table for audit
  CREATE TABLE IF NOT EXISTS public.webhook_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider text NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    signature text,
    processed boolean DEFAULT false,
    processing_time_ms integer,
    created_at timestamptz DEFAULT now()
  );
  
  -- Create index for webhook lookups
  CREATE INDEX IF NOT EXISTS webhook_events_provider_type_idx 
    ON public.webhook_events(provider, event_type, created_at DESC);
  ```

#### 4.2 RPC Functions
- [ ] Atualizar `mark_settled()` para aceitar provider info
  ```sql
  CREATE OR REPLACE FUNCTION app.mark_settled(
    _ref text,
    _provider text DEFAULT 'none',
    _settlement_id text DEFAULT NULL,
    _currency text DEFAULT NULL,
    _amount numeric DEFAULT NULL,
    _fee numeric DEFAULT NULL
  )
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    UPDATE public.payments p
    SET 
      status = 'settled',
      settlement_provider = _provider,
      settlement_id = _settlement_id,
      settlement_currency = _currency,
      settlement_amount = _amount,
      settlement_fee = _fee,
      settlement_completed_at = now(),
      settled_at = now()
    FROM public.invoices i
    WHERE p.invoice_id = i.id
      AND i.ref = _ref
      AND i.merchant_id = app.current_merchant();
  END;
  $$;
  ```

#### 4.3 Dashboard View (ChatGPT suggestion!)
- [ ] Criar view `settlement_dashboard_view`
  ```sql
  CREATE OR REPLACE VIEW app.settlement_dashboard AS
  SELECT 
    DATE(p.created_at) as date,
    COUNT(*) as total_payments,
    SUM(CASE WHEN p.status = 'confirmed' THEN 1 ELSE 0 END) as crypto_only,
    SUM(CASE WHEN p.status = 'settled' THEN 1 ELSE 0 END) as settled_to_fiat,
    SUM(i.amount_brl) as total_volume_brl,
    SUM(p.settlement_amount) as settled_volume,
    SUM(p.settlement_fee) as total_fees,
    AVG(EXTRACT(EPOCH FROM (p.settlement_completed_at - p.settlement_requested_at))) as avg_settlement_time_seconds
  FROM public.payments p
  JOIN public.invoices i ON i.id = p.invoice_id
  WHERE i.merchant_id = app.current_merchant()
    AND p.created_at >= now() - interval '30 days'
  GROUP BY DATE(p.created_at)
  ORDER BY date DESC;
  ```

#### 4.4 Apply Migration
- [ ] `supabase db reset` (local)
- [ ] Verificar schema no Studio
- [ ] Testar RPCs
- [ ] Testar view com dados mock

**DoD:** Schema suporta múltiplos providers com tracking completo + telemetria

**Commit:** `feat: add settlement provider tracking with telemetry and dashboard view`

---

## 🎨 Fase 5: UI/UX Settlement (1-2h)

### Objetivo
Interface para merchant escolher se quer/quando fazer off-ramp.

### Tasks

#### 5.1 Settings Page
- [ ] Adicionar seção "Settlement Preferences"
  - [ ] Toggle: "Auto-settle to fiat" (on/off)
  - [ ] Select provider: Circle, Wise, None
  - [ ] Configure bank account (per provider)
  - [ ] Set threshold: "Settle when balance > $X"

#### 5.2 Receipt Detail Page
- [ ] Botão "Settle to Bank" (se crypto balance)
- [ ] Modal de confirmação:
  - [ ] Mostrar quote (amount, fees, arrival time)
  - [ ] Selecionar currency (se Wise)
  - [ ] Confirmar action
- [ ] Status badge: `crypto | settling | settled`
- [ ] Link para settlement transaction

#### 5.3 Dashboard Updates
- [ ] Card: "Crypto Balance" (BRZ + USDC)
- [ ] Card: "Pending Settlements"
- [ ] Card: "Settled to Bank (Last 30 days)"
- [ ] Chart: Crypto vs Fiat over time

**DoD:** Merchant pode escolher quando/se fazer off-ramp

**Commit:** `feat: add settlement UI with provider selection`

---

## 🔒 Fase 6: Segurança & Confiabilidade (1h)

### Objetivo
Garantir que settlement providers sejam seguros e confiáveis.

### Tasks

#### 6.1 HMAC Validation
- [ ] Implementar validação Circle webhook
  - [ ] Verificar `X-Circle-Signature` header
  - [ ] Comparar com hash calculado
  - [ ] Rejeitar se inválido (401)

- [ ] Implementar validação Wise webhook
  - [ ] Verificar `X-Signature` header
  - [ ] Algoritmo específico da Wise
  - [ ] Rejeitar se inválido (401)

#### 6.2 Idempotência
- [ ] Usar `invoiceRef` como idempotency key
- [ ] Prevenir duplicate payouts
- [ ] Check no banco antes de criar payout
- [ ] Retornar existing payout se já existe

#### 6.3 Rate Limiting
- [ ] Adicionar rate limit nas Edge Functions públicas
  - [ ] Webhook endpoints: 100 req/min por IP
  - [ ] Payout endpoints: 10 req/min por merchant
  - [ ] Usar Supabase Edge Function rate limiting

#### 6.4 Monitoring
- [ ] Log todas as chamadas de API (Circle/Wise)
- [ ] Track latência (P50, P95, P99)
- [ ] Alert em errors 5xx
- [ ] Dashboard no Supabase Logs

**DoD:** Sistema seguro contra replay attacks, rate abuse, e falhas

**Commit:** `feat: add security layer with HMAC validation and rate limiting`

---

## 🧪 Fase 7: Testing E2E (1-2h)

### Tabela de Testes (ChatGPT suggestion!)

| # | Etapa | Ação | Esperado | Status |
|---|-------|------|----------|--------|
| 1 | **Solana Pay** | Cliente paga USDC via QR | Tx confirmada < 10s | [ ] |
| 2 | **Circle Payout** | Merchant clica "Settle USD" | Payout created | [ ] |
| 3 | **Circle Webhook** | Aguardar webhook | Status → `settled` | [ ] |
| 4 | **Wise Quote** | Solicitar quote BRL | Fees calculados | [ ] |
| 5 | **Wise Transfer** | Executar transfer | Status → `processing` | [ ] |
| 6 | **Wise Webhook** | Aguardar callback | Status → `settled` | [ ] |
| 7 | **Dashboard** | Abrir Reports | Métricas corretas | [ ] |
| 8 | **Crypto-Only** | Não fazer settle | Balance mantido | [ ] |

### Manual Testing

#### Test 1: Circle Off-Ramp (USD)
- [ ] Criar cobrança R$ 100 (= ~$20 USD)
- [ ] Receber USDC na wallet
- [ ] Clicar "Settle to Bank (USD)"
- [ ] Verificar payout criado no Circle sandbox
- [ ] Aguardar webhook (pode levar 1-2 min)
- [ ] Status muda para "settled"
- [ ] Verificar no Circle dashboard
- [ ] Checar `webhook_events` table

#### Test 2: Wise Off-Ramp (BRL)
- [ ] Criar cobrança R$ 50
- [ ] Receber BRZ na wallet
- [ ] Clicar "Settle to Bank (BRL)"
- [ ] Ver quote (amount + fees)
- [ ] Confirmar
- [ ] Verificar transfer no Wise sandbox
- [ ] Aguardar webhook
- [ ] Status "settled"
- [ ] Checar tempo de settlement (avg)

#### Test 3: Crypto-Only (No Settlement)
- [ ] Criar cobrança
- [ ] Receber crypto
- [ ] NÃO fazer settle
- [ ] Verificar balance acumula
- [ ] Dashboard mostra "crypto_only" ✅

#### Test 4: Webhook Replay Attack
- [ ] Capturar webhook legítimo
- [ ] Reenviar (replay)
- [ ] Verificar: rejeitado ou idempotente
- [ ] Não duplicar settlement

#### Test 5: Invalid Signature
- [ ] Enviar webhook com signature errada
- [ ] Verificar: 401 Unauthorized
- [ ] Não processar evento

### Edge Cases
- [ ] Saldo insuficiente para payout
- [ ] Webhook com signature inválida
- [ ] Network timeout durante payout
- [ ] Provider API down (fallback behavior)
- [ ] Currency não suportada
- [ ] Amount abaixo do mínimo

**DoD:** Todos os fluxos testados e funcionando no sandbox com segurança validada

---

## 📊 Fase 8: Métricas & Telemetria (30 min)

### Objetivo
Coletar métricas para demonstrar performance no hackathon.

### Tasks

#### 8.1 Performance Metrics
- [ ] Implementar tracking de:
  - [ ] **TPS** (transactions per second) on-chain
  - [ ] **Latência P95** (validate-payment)
  - [ ] **Settlement time** (requested → completed)
  - [ ] **Success rate** por provider
  - [ ] **Fee efetiva** por rota

#### 8.2 Dashboard Cards
- [ ] Card: "Avg Settlement Time"
  - [ ] Circle: X minutes
  - [ ] Wise: Y minutes
  
- [ ] Card: "Total Fees Paid"
  - [ ] Breakdown por provider
  - [ ] % do volume

- [ ] Card: "Crypto vs Fiat"
  - [ ] % mantido em crypto
  - [ ] % convertido para fiat

#### 8.3 Logs Estruturados
- [ ] Adicionar structured logging
  ```typescript
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'circle-payout',
    action: 'payout_created',
    invoiceRef: '...',
    amount: 100,
    latency_ms: 234,
  }));
  ```

**DoD:** Métricas coletadas e exibidas no dashboard

**Commit:** `feat: add telemetry and performance metrics tracking`

---

## 📝 Fase 9: Documentation (30 min)

- [ ] Atualizar `README.md`
  - [ ] Seção "Settlement Providers"
  - [ ] Env vars: CIRCLE_API_KEY, WISE_API_KEY
  - [ ] Configuração de webhooks
  - [ ] Feature flags

- [ ] Atualizar `SETTLEMENT_ARCHITECTURE_BR.md`
  - [ ] Adicionar exemplos de código real implementado
  - [ ] Screenshots do sandbox
  - [ ] Métricas de performance

- [ ] Atualizar `.env.example`
  - [ ] Adicionar variáveis Circle e Wise
  - [ ] Feature flags

- [ ] Criar `SETTLEMENT_TESTING.md`
  - [ ] Guia de setup sandbox (Circle + Wise)
  - [ ] Test scenarios com expected results
  - [ ] Troubleshooting comum
  - [ ] Webhook testing com ngrok

**Commit:** `docs: add settlement provider setup and testing guides`

---

## 🎯 Definition of Done - Day 2

### Funcional
- [ ] Circle off-ramp USD funcionando no sandbox
- [ ] Wise off-ramp BRL funcionando no sandbox
- [ ] Webhooks processando corretamente
- [ ] UI permite escolher provider
- [ ] Merchant pode manter crypto (não obrigatório settle)

### Técnico
- [ ] Schema atualizado com settlement tracking
- [ ] RPCs suportam múltiplos providers
- [ ] HMAC validation em todos os webhooks
- [ ] Idempotência garantida
- [ ] Logs completos para audit

### Testes
- [ ] Fluxo completo Circle testado
- [ ] Fluxo completo Wise testado
- [ ] Crypto-only testado (sem settlement)
- [ ] Webhooks testados (happy path + errors)

### Documentação
- [ ] Guias de setup atualizados
- [ ] Env vars documentadas
- [ ] Test scenarios escritos

---

## 📊 Progress Tracker

**Início:** ____:____
**Fase 1 concluída:** ____:____
**Fase 2 concluída:** ____:____
**Fase 3 concluída:** ____:____
**Fase 4 concluída:** ____:____
**Fase 5 concluída:** ____:____
**Fase 6 concluída:** ____:____
**Fim:** ____:____

**Total de horas:** ____h

---

## 🚀 Próximos Passos (Day 3 - 9 OUT)

### Jupiter Integration (Multi-Token)
- [ ] Implementar Jupiter SDK
- [ ] Auto-swap: SOL/BONK/qualquer → USDC/BRZ
- [ ] UI: "Accept any token" toggle
- [ ] Slippage configuration
- [ ] Best route display

### Polish & Performance
- [ ] Loading states optimization
- [ ] Error messages i18n
- [ ] Mobile responsiveness
- [ ] Performance profiling

---

## 📝 Notas & Blockers

### 🎯 Decisões Estratégicas
- ✅ **Sem Transfero** (API não liberada) → Wise + Circle
- ✅ **Circle para USD** (crypto-native, USDC issuer)
- ✅ **Wise para BRL** (50+ moedas, low fees)
- ✅ **Settlement opcional** (cypherpunk core mantido)

### 💡 Insights de Ontem
- Solana Pay = protocolo (como SEP-24 Stellar)
- Demo mode essencial para apresentações
- Local vs Production env detection crucial
- Documentação detalhada economiza horas

### 🐛 Watch Out For
- Circle sandbox pode ter rate limits
- Wise requer balance pré-carregado no sandbox
- Webhooks precisam endpoint público (ngrok para local)
- HMAC signatures diferentes por provider

---

## 🔧 Comandos Úteis

### Circle API Testing
```bash
# Test authentication
curl https://api-sandbox.circle.com/v1/configuration \
  -H "Authorization: Bearer $CIRCLE_API_KEY"

# Create payout
curl -X POST https://api-sandbox.circle.com/v1/businessAccount/payouts \
  -H "Authorization: Bearer $CIRCLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "test-123",
    "amount": {"amount": "10.00", "currency": "USD"},
    "destination": {"type": "wire", "id": "recipient-id"}
  }'
```

### Wise API Testing
```bash
# Test authentication
curl https://api.sandbox.transferwise.tech/v1/profiles \
  -H "Authorization: Bearer $WISE_API_KEY"

# Create quote
curl -X POST https://api.sandbox.transferwise.tech/v3/profiles/$PROFILE_ID/quotes \
  -H "Authorization: Bearer $WISE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceCurrency": "USD",
    "targetCurrency": "BRL",
    "sourceAmount": 100
  }'
```

### Local Webhook Testing (ngrok)
```bash
# Expose local Edge Functions
ngrok http 54321

# Update webhook URL in Circle/Wise dashboard
# https://xxxx.ngrok.io/functions/v1/circle-webhook
```

---

## 🎬 Demo Script Update

### New Flow to Show
1. Cliente paga R$ 100 via Solana Pay ✅
2. Merchant recebe BRZ na wallet ✅
3. **NOVO:** Merchant clica "Settle to PIX" (opcional)
4. **NOVO:** Wise processa: BRZ → R$ 98 (após fees)
5. **NOVO:** Webhook confirma: "Settled to bank"
6. **NOVO:** PDF oficial disponível

### Pitch Enhancement
*"Diferente de outros projetos que forçam conversão para fiat, nós damos escolha ao merchant:*
- *Quer manter crypto? Perfeito, já está na wallet.*
- *Quer converter para fiat? Um clique, via Circle ou Wise.*
- *Zero dependência bancária obrigatória. Pure cypherpunk."* 🏴‍☠️

---

## 📈 Métricas do Dia

**Commits esperados:** 8-10  
**Arquivos novos:** 6-8  
**Edge Functions:** +3 (circle-payout, wise-payout, webhooks)  
**Providers implementados:** 2 (Circle, Wise)  
**Progresso:** 85% → 90%

---

**🔥 LET'S BUILD! 🔥**
