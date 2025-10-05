# Merchant AI Checkout (Solana “PIX‑like” + Global Settlement)

> **PWA POS com agente de IA** para comerciantes receberem cripto no celular (Solana Pay + BRZ/USDC), com **recibo PIX‑like on‑chain** imediato e **liquidação opcional em moeda local** via provedores (ex.: **PIX** no Brasil). O mesmo app atende a trilha **Brasil** (PIX) e o **global** (experiência “PIX‑like” com stablecoin e off‑ramp).

---

## 🚀 Quick Start

### Pré‑requisitos

* Node.js 18+ (recomendado via `nvm`)
* **Supabase CLI** (para DB local e migrations)

### Instalação e Execução

```bash
# Clone
git clone <YOUR_GIT_URL>
cd lovable-pos-cashier

# Dependências
npm install

# Supabase (local)
npx supabase start
# ou
npx supabase db reset   # aplica migrations e seeds

# Dev: Web + API (porta 5173 para web, 5174 para API)
npm run dev
```

### Acesso (dev)

* **App (Vite)**: [http://localhost:5173](http://localhost:5173)
* **API (Node)**: [http://localhost:5174](http://localhost:5174)
* **Supabase Studio**: [http://localhost:54323](http://localhost:54323)

> Dica: a **web** faz **proxy** de `/api/*` para o servidor da API. Ajuste as portas em `vite.config.ts` / `api/index.ts` se necessário.

---

## 🛠️ Stack Tecnológica

### Frontend

* **Vite + React 18 + TypeScript**
* **Tailwind CSS** + **shadcn/ui** (design system)
* **Framer Motion** (micro‑animações)
* **React Router** (rotas)
* **PWA**: `manifest.json`, service worker placeholder
* **i18n EN/pt‑BR** e **dark mode**

### Backend & Dados

* **Supabase**

  * PostgreSQL + **RLS** (multi‑tenancy seguro)
  * Auth (email/OTP/OAuth)
  * Realtime (assinado nas **tabelas base**, não em views)
  * **Edge Functions** - Serverless APIs (Deno runtime)
    * On-chain validation
    * Settlement webhooks
    * PDF generation
    * CSV export

### Cripto & Pagamentos

* **Solana Web3.js**
* **Solana Pay** (deep link/QR + `reference`)
* **Auto‑swap p/ stable** (USDC/USDT) via **Jupiter** (*opcional*)
* **Settlement Providers** (abstração): `mock` | `transfero` (PIX BR) | `stripe` | `circle` *(drivers opcionais)*

---

## 📦 Estrutura do Projeto

```
src/
├─ components/               # UI (shadcn/ui + custom)
├─ hooks/                    # useAuth, useMerchant, useReceipts, etc.
├─ pages/                    # telas (Landing, POS, Receipts, Settings, ...)
├─ lib/                      # helpers (format, wallet, etc.)
├─ integrations/
│  └─ supabase/              # client tipado + types-generated.ts
└─ styles/

api/
├─ index.ts                  # bootstrap servidor (porta 5174)
├─ payments/
│  └─ status.ts              # GET /api/payments/status?reference=...
├─ settlement/
│  ├─ webhook.ts             # POST /api/settlement/webhook (router por provider)
│  └─ receipt/[paymentId].ts # GET /api/settlement/receipt/:paymentId
└─ export/
   └─ csv.ts                 # GET /api/export/csv

supabase/
├─ migrations/               # SQL (schema, RLS, RPCs, seeds)
└─ config.toml
```

---

## ⚙️ Variáveis de Ambiente

### Client (Vite) → `.env.local`

> Tudo que o client usa deve começar com `VITE_`.

```env
# Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# App
VITE_DEMO_MODE=true
VITE_I18N_DEFAULT=pt-BR

# Solana (seguro no client)
VITE_SOLANA_CLUSTER=mainnet-beta
VITE_BRZ_MINT=FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD
```

### Server (API) → `.env.server`

> **Nunca** expor no client; lido apenas em `api/`.

```env
# Supabase (server)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE=...

# Solana (server)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
MERCHANT_RECIPIENT=<SPL address do lojista>

# Settlement (provider selection)
SETTLEMENT_PROVIDER=mock   # mock | transfero | stripe | circle
ENABLE_PIX_SETTLEMENT=false

# Transfero (se usar)
TRANSFERO_BASE_URL=https://staging-openbanking.bit.one/
TRANSFERO_API_VERSION=2
TRANSFERO_ACCOUNT_ID=...
TRANSFERO_CLIENT_ID=...
TRANSFERO_CLIENT_SECRET=...
```

### Tipos do Supabase (opcional, recomendado)

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase gen types typescript --linked --schema public,app > src/integrations/supabase/types-generated.ts
```

**Supabase Studio → Settings → API → Exposed schemas →** adicionar `app`.

Para informações detalhadas sobre o schema PostgreSQL, consulte: **[📊 supabase/DATABASE_SCHEMA.md](supabase/DATABASE_SCHEMA.md)**

---

## 🗃️ Banco de Dados (Supabase)

### Tabelas (core)

* `merchants` — dados da loja
* `merchant_members` — vínculo usuário↔loja (`owner|staff`, `is_default`)
* `products` — catálogo simples
* `invoices` — cobrança canônica (`reference`, `amount_brl`)
* `payments` — eventos de pagamento (método, `confirmed|settled|failed`, `chain_tx`, `pix_payment_id`)
* **VIEW** `receipts` — shap de UI (join de invoices+payments, status derivado)

### RLS & Policies

* Todas as tabelas com RLS; policies por `merchant_id` (e via join em `payments`).
* Realtime: assine **invoices** e **payments** (views não emitem eventos).

### RPCs (helpers — já integrados nos hooks)

* `app.set_default_merchant(merchant_id)`
* `app.current_merchant()`
* `app.create_invoice_with_payment(amount, ref, product_ids)` — cria **invoice** (e payment inicial, se desejar)
* `app.update_payment_status(invoice_id, status, tx_hash)` — estado do payment/invoice
* `app.mark_confirmed(ref, tx_hash)` — confirmado on‑chain
* `app.mark_settled(ref)` — liquidado pelo provider
* `app.list_receipts(from, to)` — lista para UI/relatórios

> **Nota:** seus hooks (`useReceipts`, `useMerchant`, etc.) já usam essas RPCs tipadas. Gere os **types** para remover qualquer `@ts-ignore` remanescente.

---

## 🔗 Edge Functions (Supabase)

* `GET /validate-payment`

  * Busca assinatura por `reference` e **valida** (recipient, amount, **BRZ mint**, reference).
  * Ao validar, chama `app.mark_confirmed(ref, txHash)` e responde `{ status:'confirmed', tx }`.
  * Integração direta com RPC functions do Supabase.

* `POST /settlement-webhook`

  * Entrada única de webhooks. Roteia por `SETTLEMENT_PROVIDER`.
  * Valida **assinatura/HMAC** (quando disponível) e chama `app.mark_settled(ref)`.

* `GET /get-receipt-pdf/:paymentId`

  * Proxy de **PDF** oficial (quando o provider suportar). Caso contrário, retorna 501.
  * Acesso direto ao Supabase Storage.

* `GET /export-csv`

  * Exporta CSV usando função SQL ou SELECT.
  * Query direta no banco via Service Role.

### Deploy das Edge Functions

```bash
# Deploy individual
supabase functions deploy validate-payment

# Deploy todas
supabase functions deploy
```

> **Vantagens:** Zero cold start, integração nativa com Supabase, global CDN, Service Role automático.

---

## 🧭 Fluxo (Brasil vs Global)

### Brasil (PIX “vero” quando habilitado)

1. POS → cria invoice (`pending`) e exibe **Solana Pay QR** (BRZ por padrão).
2. Cliente paga → server valida on‑chain → `confirmed` (recibo **PIX‑like** disponível).
3. Opcional **Liquidar via PIX** (provider `transfero`) → webhook `settled` → botão **PDF oficial**.

### Global (experiência “PIX‑like”)

1. POS aceita **SOL/qualquer SPL**; opcional **auto‑swap** para **USDC** via Jupiter.
2. `confirmed` → comerciante pode manter em stable ou iniciar **off‑ramp** via provider (`stripe`/`circle`, dependendo do país).
3. Recibo **PIX‑like** sempre disponível; “settled to fiat” quando o provider confirmar.

---

## 👛 UX de Wallet & Solana Pay

* Deep links para **Phantom / Backpack / Solflare**; fallback “copiar link”.
* **Timer/Expiração** do QR (5–10min) + “Regenerar”.
* **High‑contrast** para uso externo; print CSS **thermal‑like** no recibo.

### Validação On‑chain

* `reference` único por cobrança.
* `validateTransfer`: checar **recipient**, **amount**, **BRZ mint** (ou mint permitido), e `reference`.
* Atualizar estado via RPC (`mark_confirmed`).

---

## 🧩 Settlement Providers (abstração)

Crie uma interface única no server:

```ts
export type SettlementProvider = 'mock' | 'transfero' | 'stripe' | 'circle'
export interface SettlementDriver {
  createPayout?(args: { invoiceId: string; amountBRL: number; ... }): Promise<{ paymentId: string }>
  getReceiptPDF?(paymentId: string): Promise<Buffer>
  verifyWebhook?(req: Request): boolean
}
```

Drivers opcionais em `api/settlement/providers/*`.

* `mock` — sempre confirma (para demo).
* `transfero` — PIX BR (payout + recibo PDF quando disponível).
* `stripe` — aceitar **USDC** e liquidar **USD** (dependente de elegibilidade/país).
* `circle` — rampas de **USDC** para conta bancária via parceiros.

> UI **nunca** mostra marca do PSP; só “PIX settlement (opcional)”.

---

## 🔒 Segurança

* **RLS** em todas as tabelas; policies por merchant.
* **Webhooks** assinados (HMAC/secret) e **replay protection**.
* **Idempotência** por `reference`/`invoice_id`.
* **Logs/Auditoria**: salvar payloads de webhook e decisões de validação.
* **Privacidade**: não custodiar chaves privadas; apenas deep links/QR.

---

## 🧠 Programa Solana (opcional)

* **Transaction Request**: a wallet assina uma tx chamando o programa **`merchant_checkout`**.
* Lógica on‑chain: **split de taxa** + **evento `SalePaid`** (para indexação).
* **Fallback** automático para transfer simples se a wallet não suportar.

Flags (exemplo):

```env
VITE_USE_CONTRACT=false
PROGRAM_ID=Merchxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📈 Reports & CSV

* `/reports`: KPIs (Total R$, Tx count, Avg ticket, % settled) + mini‑gráficos.
* CSV diário via Edge Function `/export-csv` ou função SQL dedicada.

---

## 🏗️ Arquitetura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── POS/            # Componentes específicos do POS
│   └── ...             # Outros componentes
├── hooks/              # Custom hooks (useReceipts, useMerchant, etc.)
├── pages/              # Páginas da aplicação (POS, Receipts, etc.)
├── lib/                # Utilitários e configurações
├── types/              # Definições TypeScript
└── integrations/       # Integrações externas
    └── supabase/       # Configuração Supabase

supabase/
├── migrations/         # Migrações SQL
├── functions/          # Edge Functions (Deno runtime)
│   ├── validate-payment/
│   ├── settlement-webhook/
│   ├── get-receipt-pdf/
│   └── export-csv/
└── config.toml        # Configuração Supabase
```

### Fluxo de Dados

1. **Frontend** (Vite + React) → **Supabase Client** → **PostgreSQL**
2. **Edge Functions** → **RPC Functions** → **PostgreSQL**
3. **Webhooks externos** → **Edge Functions** → **Database updates**
4. **Realtime subscriptions** → **UI updates**

---

## 🎬 Submissões (Global + Brasil)

**Colosseum (Global)**

* Nome, one‑liner, logo
* Links: **repo**, **demo**, **vídeo pitch (≤3min)**, **vídeo técnico (≤3min)**
* Time (Brasil), redes, declarações de elegibilidade

**Superteam Earn (Side Track Brasil)**

* Inscrever após a submissão no Colosseum, com os mesmos links

**Roteiro dos vídeos**

* *Pitch*: problema → solução (demo curta) → por que agora (Solana + PIX) → mercado → modelo → roadmap.
* *Técnico*: arquitetura (Vite/Supabase/RLS/API), validação on‑chain, abstraction de settlement, opcional programa.

---

## 🗺️ Roadmap (até o fim de outubro)

* **Semana 1**: UX multi‑wallet + expiração + print‑thermal; Edge Function `/validate-payment` com `validateTransfer` (BRZ)
* **Semana 2**: `SettlementProvider` (`mock` primeiro; `transfero` quando credenciais chegarem); Edge Function `/settlement-webhook` com HMAC
* **Semana 3**: programa Solana via Transaction Request (split + evento); métricas TTF‑QR/Confirm
* **Semana 4**: polimento, vídeos, landing, pilotos filmados

---

## 🧪 Test Plan (MVP)

1. Criar conta → merchant default criado → Settings reflete
2. POS gera cobrança → `invoices.pending` aparece na **Receipts** (via VIEW)
3. Chamar Edge Function `/validate-payment?reference=...` → muda para **confirmed** (realtime)
4. POST no Edge Function `/settlement-webhook` (mock) → **settled**; botão **PDF** habilita (mock/real)
5. Usuário B não vê dados do merchant A (RLS ok)

---

## 📄 Licença

MIT — veja `LICENSE`.

---

## 🙌 Agradecimentos

* Comunidade Solana e organizadores do hackathon
* Transfero & parceiros de settlement
* Superteam Brazil (side track)
* Lovable.dev e o ecossistema OSS que viabilizam este MVP
