# CHECKLIST — Merchant AI Checkout (Outubro/2025)

> Guia tático de execução até as submissões **Colosseum (Global)** e **Superteam Brazil (Side Track)**.
> Timezone: **America/Sao_Paulo**. Atualize este arquivo durante a sprint.

---

## 📆 Datas & Marcos

* [ ] **Semana A (6–12 OUT)** — **On‑chain & Wallets** + POS polido + recibo thermal
* [ ] **Semana B (13–19 OUT)** — SettlementProvider (mock→Transfero ou outros PSPs), webhook HMAC, PDF
* [ ] **Semana C (20–26 OUT)** — (Opcional) programa on‑chain + auto‑swap Jupiter + métricas
* [ ] **Semana D (27–30 OUT)** — Polimento, **vídeos**, landing, submissões

> **Deadlines sugeridas**: Colosseum/Global **30 OUT**; Side Track BR **alinhado** (ver plataforma). Confirme as datas oficiais na semana D.

---

## 🧱 Setup & Infra

* [ ] **Cluster toggle** (env): `VITE_SOLANA_CLUSTER=devnet|mainnet-beta` (UI) e `SOLANA_RPC_URL` (Edge)
* [ ] **Wallet Adapter (React)**: `@solana/wallet-adapter-react(-ui)` + Phantom/Backpack/Solflare
* [ ] **Solana Pay (front)**: `@solana/pay` para gerar URL/QR
* [ ] **Supabase**: `app` exposto em Settings → API → *Exposed schemas*
* [ ] **Types TS** gerados: `public,app` → `src/integrations/supabase/types-generated.ts`
* [ ] **Secrets (Edge)** setados (dev/prod): `SUPABASE_URL`, `SERVICE_ROLE`, `ANON`, `SOLANA_RPC_URL`, `MERCHANT_RECIPIENT`, `BRZ_MINT`, `DEMO_MODE`, `WEBHOOK_SECRET`
* [ ] **Deploy Edge Functions** (prod):

  * [ ] `validate-payment` (`--verify-jwt`)
  * [ ] `export-csv` (`--verify-jwt`)
  * [ ] `settlement-webhook` (`--no-verify-jwt`)
  * [ ] `get-receipt-pdf` (`--no-verify-jwt`)
* [ ] **CORS** liberado nas responses (se domínios distintos)

---

## 💳 POS (Frontend)

* [ ] **Multi-wallet UX**: Phantom / Backpack / Solflare via **Wallet Adapter** + fallback "copiar link"
* [ ] **Geração de `reference`** como **PublicKey** (não UUID)
* [ ] **QR Solana Pay**: `encodeURL({ recipient, amount, reference, splToken? })`
* [ ] **Expiração de QR** (5–10 min) + botão **Regenerar**
* [ ] **Indicadores de estado**: `pending → confirmed → settled → error`
* [ ] **Impressão**: CSS **thermal-like** no recibo + botão **Print/Share**
* [ ] **Realtime**: assinar **invoices** e **payments** (não a view)

**DoD**: do valor ao **QR** < 2s; confirmação **visual** em tempo real quando `confirmed` chegar.

## 🎤 UI/UX - Voice & Chat Interface

* [ ] **VoiceInput.tsx**: Interface de reconhecimento de voz
  * [ ] Web Speech API integrada
  * [ ] Comandos de voz: "Cobrança de X reais", "Produto Y"
  * [ ] Feedback visual durante gravação
  * [ ] Fallback para teclado quando voz indisponível
* [ ] **ChatAssistant.tsx**: Assistente inteligente
  * [ ] Comandos naturais: "Crie uma cobrança de 100 reais"
  * [ ] Processamento de linguagem natural
  * [ ] Histórico de comandos
  * [ ] Integração com OpenAI GPT-4 (opcional)
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

* [ ] **`validate-payment`** (real, com `@solana/pay`):

  * [ ] Checa **recipient**, **amount**, **mint (BRZ)**, **reference**
  * [ ] **Commitment**: `confirmed` (configurável para `finalized` se necessário)
  * [ ] Chama `app.mark_confirmed(ref, tx)`
  * [ ] `DEMO_MODE` desligável por env
* [ ] **`settlement-webhook`**:

  * [ ] Validação **HMAC** (header correto do PSP)
  * [ ] Persiste `settled` e `pix_payment_id`
  * [ ] Loga raw payload em `webhook_events` (opcional)
* [ ] **`get-receipt-pdf`**:

  * [ ] OAuth client credentials (Transfero) → fetch PDF
  * [ ] Retorna `application/pdf`
* [ ] **`export-csv`**: JWT do usuário, CSV com `created_at,amount_brl,status,ref,tx_hash`

**DoD**: funções respondem em < 300 ms (sem rede externa) / < 1s (com PSP).

---

## 🗃️ Banco & RPCs (Supabase)

* [ ] **Migrations** aplicadas: `merchants`, `merchant_members`, `products`, `invoices`, `payments`, **VIEW `receipts`**
* [ ] **RLS** revisada (por `merchant_id` + join em `payments`)
* [ ] **RPCs** em produção: `set_default_merchant`, `current_merchant`, `create_invoice_with_payment`/`create_receipt`, `mark_confirmed`, `mark_settled`, `update_payment_status`, `list_receipts`
* [ ] **Índices**: `invoices(reference) unique`, `payments(invoice_id,status)`, `products(merchant_id,active)`
* [ ] **(Opcional)** migrar valores monetários para **minor units (BIGINT)**

**DoD**: usuário B não acessa dados do merchant A; consultas principais retornam < 100 ms.

---

## 🔄 Settlement Providers

* [ ] **Interface** `SettlementProvider` definida (mock/transfero/stripe/circle)
* [ ] **Flag** de seleção em env: `SETTLEMENT_PROVIDER=mock|transfero|stripe|circle`
* [ ] **mock**: endpoint que sempre confirma (para demo) + botão "Simular liquidação"
* [ ] **Transfero**: credenciais salvas como secrets + mapeamento de campos (`reference`, `paymentId`)
* [ ] **Webhook** conectado ao provider real quando disponível
* [ ] **PDF oficial** habilitado quando `settled` e provider suportar

**DoD**: botão **Liquidar** visível; em demo, muda para `settled` via webhook mock em < 3s.

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

* [ ] Login → merchant default criado
* [ ] POS: criar cobrança → aparece **pending** (VIEW `receipts`)
* [ ] Pagamento (ou DEMO): `/validate-payment` → **confirmed**; UI atualiza via realtime
* [ ] `curl` webhook (mock) com HMAC válido → **settled** + PDF (mock/real)
* [ ] Usuário B **não vê** dados do A (RLS ok)
* [ ] PWA instalável; **print thermal** do recibo funciona
* [ ] **Voice/Chat**: comando de voz cria cobrança em < 5s
* [ ] **QuickCharge**: botões rápidos funcionam
* [ ] **Keyboard shortcuts**: atalhos respondem corretamente
* [ ] **Export automático**: CSV enviado por email
* [ ] **Performance**: loading < 2s em todas as telas

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
