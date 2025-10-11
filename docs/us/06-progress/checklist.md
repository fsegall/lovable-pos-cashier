# 🤖 CHECKLIST — Solana Merchant AI (Outubro/2025)

> Guia tático de execução até as submissões **Colosseum (Global)** e **Superteam Brazil (Side Track)**.
> Timezone: **America/Sao_Paulo**. Atualizado: **10 OUT 2025**.

## 📊 Progresso Atual (10 OUT 2025)

**✅ CONCLUÍDO (Day 1-2: 7-8 OUT):**
- **Setup & Infra**: Supabase configurado, 10 Edge Functions implementadas
- **AI Features**: Chat Assistant + Voice Assistant (OpenAI Realtime)
- **Solana Pay**: Wallet Adapter + QR generation + Direct payment
- **Settlement**: Wise + Circle Edge Functions + webhooks
- **Database**: settlements + webhook_events tables
- **🎉 MILESTONE**: Primeiro pagamento on-chain REAL confirmado!

**✅ CONCLUÍDO (Day 9: 9 OUT):**
- **Settlement UI**: Panel + Modal com provider selection
- **Dashboard Analytics**: 7 cards (4 main + 3 settlement)
- **Settings Page**: Provider configuration UI
- **Wise Integration**: Testado até Quote + DEMO MODE implementado
- **Documentation**: 15+ docs criados (Wise, Circle, Settlement)
- **Debug Tools**: Comprehensive troubleshooting guides

**✅ CONCLUÍDO (Day 10: 10 OUT - HOJE!):**
- **🪐 Jupiter Integration**: Multi-token support (100+ SPL tokens!)
  - useJupiterSwap hook
  - TokenSelector UI component
  - BRZ, USDC, EURC settlement options
  - Dynamic token support in payments
- **🤖 Rebranding**: "Solana Merchant AI" - AI features highlighted
- **📚 Docs Reorganization**: 42 docs em estrutura temática (br/us folders)
- **📱 Social Media Strategy**: Templates + calendar delegado

**🔄 EM ANDAMENTO (Próximas horas):**
- Testing Jupiter UI
- HMAC validation nos webhooks
- Screenshots profissionais (7-10)
- Final polish

**📈 PROGRESSO GERAL: ~95% concluído!** 🚀✨

---

## 🏆 ACHIEVEMENTS DESBLOQUEADOS

- ✅ On-chain payment 100% funcional
- ✅ AI Assistant (chat + voice)
- ✅ Multi-token (Jupiter - 100+ tokens)
- ✅ Global settlement (BRZ/USD/EUR)
- ✅ Professional docs structure
- ✅ DEMO MODE para sandbox limitations
- ✅ Production-ready codebase

---

## 📆 Datas & Marcos

* [x] **Semana A (6–12 OUT)** — **On‑chain & Wallets** + POS polido ✅ **COMPLETO!**
  * [x] Wallet Adapter (Phantom, Solflare) ✅
  * [x] Solana Pay QR generation ✅
  * [x] Demo mode end-to-end ✅
  * [x] tBRZ devnet setup ✅
* [ ] **Semana B (8–14 OUT)** — Validação real + SettlementProviders (Transfero PIX, Circle/Stripe USDC)
* [ ] **Semana C (15–20 OUT)** — Passkey/Embedded Wallets + Polimento + (Opcional) programa on‑chain
* [ ] **Semana D (21–30 OUT)** — Vídeos, landing, submissões

> **Deadlines sugeridas**: Colosseum/Global **30 OUT**; Side Track BR **alinhado** (ver plataforma). Confirme as datas oficiais na semana D.

---

## 🧱 Setup & Infra

* [x] **Cluster toggle** (env): `VITE_SOLANA_CLUSTER=devnet|mainnet-beta` (UI) e `SOLANA_RPC_URL` (Edge) ✅
* [x] **Wallet Adapter (React)**: `@solana/wallet-adapter-react(-ui)` + Phantom/Backpack/Solflare ✅
* [x] **Solana Pay (front)**: `@solana/pay` para gerar URL/QR ✅
* [x] **Supabase**: `app` exposto em Settings → API → *Exposed schemas* ✅
* [x] **Types TS** gerados: `public,app` → `src/integrations/supabase/types-generated.ts` ✅
* [x] **Secrets (Edge)** setados (dev/prod): `SUPABASE_URL`, `SERVICE_ROLE`, `ANON`, `SOLANA_RPC_URL`, `MERCHANT_RECIPIENT`, `BRZ_MINT`, `DEMO_MODE`, `WEBHOOK_SECRET` ✅
* [x] **Deploy Edge Functions** (local): ✅ 10 functions servindo
  * [x] `validate-payment` (implementado + JWT auth)
  * [x] `export-csv` (implementado)
  * [x] `settlement-webhook` (implementado)
  * [x] `get-receipt-pdf` (implementado)
  * [x] `chat-assistant` (implementado)
  * [x] `openai-realtime-token` (implementado)
  * [x] `circle-payout` (implementado - Day 2) ✨
  * [x] `circle-webhook` (implementado - Day 2) ✨
  * [x] `wise-payout` (implementado - Day 2) ✨
  * [x] `wise-webhook` (implementado - Day 2) ✨
* [ ] **CORS** liberado nas responses (se domínios distintos)

---

## 💳 POS (Frontend)

* [x] **Multi-wallet UX**: Phantom / Solflare via **Wallet Adapter** ✅ IMPLEMENTADO
  * [x] WalletMultiButton no header
  * [x] Auto-connect suportado
  * [ ] **Passkey/Embedded Wallets** (roadmap) - Phantom Embedded ou Web3Auth
    * [ ] Login social (Google/Apple/Email)
    * [ ] MPC wallet sem seed phrase
    * [ ] Biometria (Face ID/Touch ID)
    * [ ] Zero friction onboarding
* [x] **Geração de `reference`** como **PublicKey** ✅ IMPLEMENTADO
* [x] **QR Solana Pay**: `encodeURL({ recipient, amount, reference, splToken? })` ✅ IMPLEMENTADO
* [x] **Expiração de QR** (10 min) + botão **Regenerar** ✅ IMPLEMENTADO
* [x] **Indicadores de estado**: `pending → confirmed → settled → error` ✅ IMPLEMENTADO
* [ ] **Impressão**: CSS **thermal-like** no recibo + botão **Print/Share**
* [x] **Realtime**: assinar **invoices** e **payments** ✅ IMPLEMENTADO

**DoD**: do valor ao **QR** < 2s; confirmação **visual** em tempo real quando `confirmed` chegar.

## 🎤 UI/UX - Voice & Chat Interface

* [x] **VoiceInput.tsx**: Interface de reconhecimento de voz ✅ IMPLEMENTADO
  * [x] OpenAI Realtime API integrada
  * [x] Push-to-talk com feedback visual
  * [x] WebSocket para STT/TTS em tempo real
  * [x] Fallback para teclado quando voz indisponível
* [x] **ChatAssistant.tsx**: Assistente inteligente ✅ IMPLEMENTADO
  * [x] Comandos naturais: "Crie uma cobrança de 100 reais"
  * [x] Processamento de linguagem natural
  * [x] Histórico de comandos
  * [x] Integração com OpenAI GPT-4 via Edge Function
* [ ] **QuickCharge.tsx**: Cobrança rápida
  * [ ] Botões de valores predefinidos (R$ 10, 25, 50, 100)
  * [ ] Shortcuts de teclado (F1-F9)
  * [ ] Cache de produtos frequentes
* [ ] **Templates.tsx**: Templates de produtos
  * [ ] Produtos mais vendidos
  * [ ] Categorias rápidas
  * [ ] Histórico de cobranças recentes

**DoD**: cobrança por voz em < 5s; interface responsiva e intuitiva.

---

## 🔗 Edge Functions (Deno)

* [x] **`validate-payment`** (real, com `@solana/pay`): ✅ IMPLEMENTADO
  * [x] Checa **recipient**, **amount**, **mint (BRZ)**, **reference**
  * [x] **Commitment**: `confirmed` (configurável para `finalized` se necessário)
  * [x] Chama `app.mark_confirmed(ref, tx)`
  * [x] `DEMO_MODE` desligável por env
* [x] **`settlement-webhook`**: ✅ IMPLEMENTADO
  * [x] Validação **HMAC** (header correto do PSP)
  * [x] Persiste `settled` e `pix_payment_id`
  * [x] Loga raw payload em `webhook_events` (opcional)
* [x] **`get-receipt-pdf`**: ✅ IMPLEMENTADO
  * [x] OAuth client credentials (Transfero) → fetch PDF
  * [x] Retorna `application/pdf`
* [x] **`export-csv`**: ✅ IMPLEMENTADO - JWT do usuário, CSV com `created_at,amount_brl,status,ref,tx_hash`
* [x] **`chat-assistant`**: ✅ IMPLEMENTADO - Assistente LLM com múltiplos providers
* [x] **`openai-realtime-token`**: ✅ IMPLEMENTADO - Token ephemeral para Realtime API

**DoD**: funções respondem em < 300 ms (sem rede externa) / < 1s (com PSP).

---

## 🗃️ Banco & RPCs (Supabase)

* [x] **Migrations** aplicadas: `merchants`, `merchant_members`, `products`, `invoices`, `payments`, **VIEW `receipts`** ✅ IMPLEMENTADO
* [x] **🆕 Settlement Tables** (Day 2): `settlements`, `webhook_events` ✅ IMPLEMENTADO
* [x] **🆕 Payment Timestamps** (Day 2): `confirmed_at`, `settled_at` em payments ✅ IMPLEMENTADO
* [x] **RLS** revisada (por `merchant_id` + join em `payments`) ✅ IMPLEMENTADO
* [x] **RPCs** em produção: `set_default_merchant`, `current_merchant`, `create_invoice_with_payment`/`create_receipt`, `mark_confirmed`, `mark_settled`, `update_payment_status`, `list_receipts` ✅ IMPLEMENTADO
* [x] **🆕 mark_settled** atualizado (Day 2): cria settlements + retorna settlement_id ✅ IMPLEMENTADO
* [x] **Índices**: `invoices(reference) unique`, `payments(invoice_id,status)`, `products(merchant_id,active)`, `settlements(payment_id,provider,status)` ✅ IMPLEMENTADO
* [ ] **(Opcional)** migrar valores monetários para **minor units (BIGINT)**

**DoD**: usuário B não acessa dados do merchant A; consultas principais retornam < 100 ms.

---

## 🔄 Settlement Providers

* [x] **Interface** `SettlementProvider` definida (circle/wise/mercadopago) ✅ IMPLEMENTADO (Day 2)
* [x] **Classes** Circle e Wise implementadas em `src/lib/settlement/` ✅ IMPLEMENTADO (Day 2)
* [x] **Edge Functions** criadas: `circle-payout`, `wise-payout`, `circle-webhook`, `wise-webhook` ✅ IMPLEMENTADO (Day 2)
* [x] **Database schema** para settlements pronto ✅ IMPLEMENTADO (Day 2)
* [x] **Webhook handlers** com HMAC validation (estrutura pronta) ✅ IMPLEMENTADO (Day 2)
* [ ] **UI** de settlement no ReceiptDetail (Day 3)
* [ ] **Settings** para configurar API keys (Day 3)
* [ ] **Testes** com Circle sandbox (Day 3)
* [ ] **Testes** com Wise sandbox (Day 3)
* [ ] **PDF oficial** habilitado quando `settled` e provider suportar

**DoD**: infraestrutura completa; UI e testes para Day 3.

---

## 🧠 Programa Solana (opcional)

* [ ] **Transaction Request** chamando programa `merchant_checkout`
* [ ] **Split de taxa** (ex.: 0.5%) e **evento `SalePaid`**
* [ ] **Fallback** para transferência SPL simples quando indisponível
* [ ] **Anchor workspace** (ou `solana-program-library` padrão) configurado

**DoD**: tx com log de evento parseável; UI funciona com/sem programa.

---

## 📈 Telemetria & Reports

* [ ] Métricas: **TTF‑QR**, **TTF‑Confirm**, **success rate por wallet**, **% Settled**
* [ ] Cards em `/reports` + mini‑gráfico
* [ ] **CSV diário** validado com amostra real

**DoD**: números exibidos e conferidos com logs/DB.

## 📊 UI/UX - Performance & Export

* [ ] **ExportScheduler.tsx**: Agendamento automático de exportação
  * [ ] Exportação diária automática
  * [ ] Envio por email
  * [ ] Webhooks para sistemas externos
  * [ ] Notificações de status
* [ ] **KeyboardShortcuts.tsx**: Atalhos de teclado
  * [ ] F1: Nova cobrança
  * [ ] F2: Catálogo
  * [ ] F3: Relatórios
  * [ ] Ctrl+1-9: Produtos frequentes
  * [ ] Esc: Cancelar operação
* [ ] **OfflineIndicator.tsx**: Modo offline
  * [ ] Cache local de produtos
  * [ ] Queue de operações pendentes
  * [ ] Sincronização automática
* [ ] **Performance otimizada**:
  * [ ] Loading states < 2s
  * [ ] Lazy loading de componentes
  * [ ] Service Workers para cache
  * [ ] Web Workers para processamento

**DoD**: interface responsiva < 2s; exportação automática funcional.

---

## 📣 Build in Public

* [ ] Conta X/Twitter do projeto criada
* [ ] Post 1: **GIF** (valor→QR→confirmado→recibo)
* [ ] Post 2: arquitetura (Edge + RLS + Solana Pay)
* [ ] Post 3: **beta testers** (feiras/eventos)
* [ ] Roadmap público + issues “good first demo”

**DoD**: 3 posts publicados com engajamento inicial.

---

## 🎬 Materiais de Submissão

* [ ] **Landing** simples com vídeo(s) + link demo/repo
* [ ] **Vídeo Pitch (≤3min)** — script aprovado, gravado e publicado
* [ ] **Vídeo Técnico (≤3min)** — fluxo, arquitetura, Edge, RLS
* [ ] **Repo** limpo (README global atualizado, `supabase/functions/*`, migrations, seed)
* [ ] **Form Colosseum**: perfil, descrição, links, equipe, elegibilidade
* [ ] **Form Superteam Earn** (Side Track BR): inscrição após Colosseum

**DoD**: ambos os formulários enviados e confirmados por email.

---

## 🧪 Test Plan (smoke)

* [x] Login → merchant default criado ✅ FUNCIONANDO
* [x] POS: criar cobrança → aparece **pending** (VIEW `receipts`) ✅ FUNCIONANDO
* [x] **🎉 Pagamento REAL on-chain**: Phantom wallet → tx confirmada → **confirmed** ✅ FUNCIONANDO (Day 2)
* [x] `/validate-payment` → **confirmed**; UI atualiza via realtime ✅ FUNCIONANDO
* [x] **🆕 Direct wallet payment**: Botão "Pagar com Wallet Conectada" → tx enviada → confirmada ✅ FUNCIONANDO (Day 2)
* [x] `curl` webhook (mock) com HMAC válido → **settled** + PDF (mock/real) ✅ FUNCIONANDO
* [x] Usuário B **não vê** dados do A (RLS ok) ✅ FUNCIONANDO
* [ ] PWA instalável; **print thermal** do recibo funciona
* [x] **Voice/Chat**: comando de voz cria cobrança em < 5s ✅ IMPLEMENTADO
* [ ] **QuickCharge**: botões rápidos funcionam
* [ ] **Keyboard shortcuts**: atalhos respondem corretamente
* [ ] **Export automático**: CSV enviado por email
* [ ] **Performance**: loading < 2s em todas as telas

**🏆 MILESTONE:** Primeiro pagamento on-chain REAL confirmado em 8 OUT 2025! (R$ 18.00, ~34s)

---

## 🔧 Comandos úteis

```bash
# Deploy functions
supabase functions deploy validate-payment --verify-jwt
supabase functions deploy export-csv --verify-jwt
supabase functions deploy settlement-webhook --no-verify-jwt
supabase functions deploy get-receipt-pdf --no-verify-jwt

# Webhook mock (HMAC)
BASE=https://<PROJECT-REF>.functions.supabase.co
SECRET=<WEBHOOK_SECRET>
RAW='{"reference":"<REF_BASE58>","paymentId":"demo-123"}'
SIG=$(printf '%s' "$RAW" | openssl dgst -sha256 -hmac "$SECRET" -hex | sed 's/^.* //')

curl -X POST "$BASE/settlement-webhook" \
  -H "Content-Type: application/json" \
  -H "x-transfero-signature: $SIG" \
  -d "$RAW"
```

---

## 💰 Money Safety (com `precise-money`)

* [ ] Adicionar dependência: `npm i precise-money`
* [ ] **Parsing sem float**: converter input humano → minor units (2 casas BRL)
* [ ] **Scale** BRL (2) → **BRZ** (decimals do mint) usando `scaleUnits`
* [ ] **fromMinor/toMinor** para UI/CSV (nunca fazer `Number(...)` em valores on‑chain)
* [ ] **Slippage guard** (BPS) para auto‑swap (Jupiter)
* [ ] **Decimais do mint**: ler on‑chain via `getMint` (SPL) e **não assumir 6**

**Snippet (conceito):**

```ts
import { normalizeAmountInput, toMinor, fromMinor, scaleUnits, applySlippage } from 'precise-money'
import { getMint } from '@solana/spl-token'

// 1) BRL → cents (2)
const cents = toMinor('125.00', 2)            // → 12500n

// 2) descobrir decimais do BRZ no cluster
const mintInfo = await getMint(connection, BRZ_MINT_PK)
const dec = mintInfo.decimals                 // e.g., 6, 7, 9…

// 3) cents (2) → BRZ minor (dec)
const brzMinor = scaleUnits(cents, 2, dec)

// 4) opcional: slippage para swap
const minOut = applySlippage(brzMinor, 50)   // 50 bps

// 5) formatar para UI/CSV (nunca usar floats para lógica)
const human = fromMinor(brzMinor, dec)       // "125.000000"
```

**DoD**: nenhuma operação financeira usa `number`/float; todo cálculo com **BigInt** + conversões explícitas de casas decimais.

---

## ✅ Definition of Done (MVP)

* [ ] QR em < 2s; **confirmed** em < 10s (devnet/mainnet/DEMO)
* [ ] Recibo **PIX‑like** pronto para print/compartilhar
* [ ] Webhook muda para **settled** e habilita **PDF** (mock/real)
* [ ] RLS validada e cobertura de testes manuais feita
* [ ] README/Guia de Escopo/Checklist atualizados
* [ ] **Voice/Chat interface** funcional para comandos de voz
* [ ] **QuickCharge** e **Templates** implementados
* [ ] **Keyboard shortcuts** operacionais
* [ ] **Export automático** com agendamento
* [ ] **Performance** otimizada (< 2s loading)
* [ ] **UI/UX** responsiva e intuitiva
