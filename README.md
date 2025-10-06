# Merchant AI Checkout (Solana BRZ + PIX)

> **PWA POS with AI agent** for merchants to receive crypto payments on mobile (Solana Pay + BRZ), with **PIX-like on-chain receipts** immediately and **BRL settlement via PIX** (when enabled via Transfero). Ideal for counter, fairs and local commerce.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase CLI (for local development)

### Installation and Execution

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd lovable-pos-cashier

# Install dependencies
npm install

# Setup Supabase (local development)
npx supabase start

# Run in development mode
npm run dev
```

### Access

- **App**: http://localhost:5173
- **Supabase Studio**: http://localhost:54323

---

## 🛠️ Technology Stack

### Frontend

* **Vite + React 18 + TypeScript**
* **Tailwind CSS** + **shadcn/ui** (design system)
* **Framer Motion** (micro-animations)
* **React Router** (routing)
* **PWA**: `manifest.json`, service worker placeholder
* **i18n EN/pt-BR** and **dark mode**

### Backend & Data

* **Supabase**

  * PostgreSQL + **RLS** (secure multi-tenancy)
  * Auth (email/OTP/OAuth)
  * Realtime (subscribed to **base tables**, not views)
  * **Edge Functions** - Serverless APIs (Deno runtime)
    * On-chain validation
    * Settlement webhooks
    * PDF generation
    * CSV export

### Crypto & Payments

* **Solana Web3.js**
* **Solana Pay** (deep link/QR + `reference`)
* **BRZ Token** - Brazilian stablecoin

### Development

* **ESLint** - Linting
* **PostCSS** - CSS processing
* **Bun** - Package manager (optional)

---

## 📱 Implemented Features

### ✅ Authentication System
- Login/register with Supabase Auth
- Route protection
- Session management

### ✅ POS (Point of Sale)
- Mobile-first interface
- Numeric keypad for values
- Charge generation
- QR Code display
- Demo mode with development controls

### ✅ Receipt Management
- Automatic invoice creation
- Status tracking (pending → confirmed → settled)
- Transaction history
- Data export

### ✅ Multi-tenancy
- Merchant system
- Multiple users per merchant
- Feature flags per merchant (demo mode, etc.)

### ✅ UI/UX
- Responsive design (mobile-first)
- PWA ready (manifest.json, service worker)
- Tab navigation
- Reusable components
- Smooth animations

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Solana (future)
VITE_SOLANA_CLUSTER=devnet
VITE_BRZ_MINT=your_brz_mint_address
VITE_MERCHANT_WALLET=your_merchant_wallet

# PIX Settlement (Transfero - future)
ENABLE_PIX_SETTLEMENT=false
TRANSFERO_BASE_URL=https://staging-openbanking.bit.one/
TRANSFERO_API_VERSION=2
TRANSFERO_ACCOUNT_ID=...
TRANSFERO_CLIENT_ID=...
TRANSFERO_CLIENT_SECRET=...
```

### Database

The project uses Supabase with SQL schema included in `supabase/migrations/`. For local setup:

```bash
# Apply migrations
npx supabase db reset

# Initial seed (optional)
npx supabase db seed
```

### Supabase Types (optional, recommended)

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase gen types typescript --linked --schema public,app > src/integrations/supabase/types-generated.ts
```

**Supabase Studio → Settings → API → Exposed schemas →** add `app`.

For detailed information about the PostgreSQL schema, see: **[📊 supabase/DATABASE_SCHEMA.md](supabase/DATABASE_SCHEMA.md)**

---

## 🏗️ Project Architecture

```
src/
├── components/          # React components
│   ├── ui/             # Base components (shadcn/ui)
│   ├── POS/            # POS-specific components
│   └── ...             # Other components
├── hooks/              # Custom hooks (useReceipts, useMerchant, etc.)
├── pages/              # Application pages (POS, Receipts, etc.)
├── lib/                # Utilities and configurations
├── types/              # TypeScript definitions
└── integrations/       # External integrations
    └── supabase/       # Supabase configuration

supabase/
├── migrations/         # SQL migrations
├── functions/          # Edge Functions (Deno runtime)
│   ├── validate-payment/
│   ├── settlement-webhook/
│   ├── get-receipt-pdf/
│   └── export-csv/
└── config.toml        # Supabase configuration
```

### Data Flow

1. **Frontend** (Vite + React) → **Supabase Client** → **PostgreSQL**
2. **Edge Functions** → **RPC Functions** → **PostgreSQL**
3. **External webhooks** → **Edge Functions** → **Database updates**
4. **Realtime subscriptions** → **UI updates**

---

## 🎯 Roadmap

### 🟢 Current Phase - Web MVP
- [x] Authentication system
- [x] Basic POS interface
- [x] Receipt management
- [x] Functional demo mode
- [x] Basic PWA

### 🟡 Next Phase - Solana Integration
- [ ] Solana Web3.js integration
- [ ] Solana Pay QR codes
- [ ] On-chain confirmation
- [ ] BRZ token integration

### 🔵 Future Phase - Advanced Features
- [ ] Smart contracts
- [ ] **Real PIX settlement** (Transfero Adapter)
  - [ ] PSP Transfero integration
  - [ ] Payment webhooks
  - [ ] Official PDF receipts
- [ ] Advanced reports
- [ ] Android APK
- [ ] Printer integration

---

## 💡 Project Overview

### Problem
SMEs want to accept crypto simply, without friction and without depending on expensive hardware.

### Solution
**Web App (PWA) mobile-first** with **AI-guided chat/flow** that:

1. creates charges and displays **Solana Pay QR** (BRZ by default),
2. confirms on-chain payment in real-time,
3. generates **PIX-like receipt** (hash/txid, QR, transaction data),
4. **(optional)** settles in **R$ via PIX** using settlement adapter (Transfero),
5. exports **daily CSV** of sales.

---

## 🧠 Main Features (MVP)

* **BRZ Charge (Solana Pay)**: QR/link with `recipient`, `amount` and unique `reference` per order.
* **On-chain confirmation**: payment validation by `reference` and real-time status update.
* **PIX-like receipt**: HTML/JSX with payment data (hash/txid, BRZ value, date, QR) and **link to PIX PDF** when there's fiat settlement.
* **Daily CSV export**: simple reconciliation for the merchant.
* **Installable PWA**: Add-to-Home Screen, shell cache, basic offline.

> **Legal note**: the **"PIX-like receipt"** is a **layout** compatible with the PIX experience, but **is not** an official PIX operation until **settlement via partner** occurs (ex.: Transfero). The layout serves as on-chain proof.

---

## 🏗️ Architecture

```
src/
├── components/          # React components
├── hooks/              # Custom hooks
├── pages/              # Application pages
├── lib/                # Utilities and configurations
├── types/              # TypeScript definitions
└── integrations/       # External integrations
    └── supabase/       # Supabase configuration

supabase/
├── migrations/         # SQL migrations
├── functions/          # Edge Functions (Deno runtime)
│   ├── validate-payment/
│   ├── settlement-webhook/
│   ├── get-receipt-pdf/
│   └── export-csv/
└── config.toml        # Supabase configuration
```

### High-Level Flow

1. Operator types value → **Generate QR** (Solana Pay with BRZ).
2. Customer pays via wallet → backend confirms **on-chain** → `payments.status="confirmed"`.
3. **PIX-like receipt** becomes available immediately.
4. **(Optional)** **Settle via PIX** button (Transfero adapter): creates PIX payment → waits for `settled` webhook → exposes **official PDF**.

---

## 🧩 Transfero Adapter (PIX)

**Objective:** offer **real PIX** (BRL settlement) **after** crypto payment.

Minimum functions:

* `createPixDynamicQR(payload)` (optional for PIX pay-in)
* `newPixPayment({ amount, name, taxIdCountry, taxId, pixKey })` (pay-out)
* `getPaymentReceiptPDF(paymentId)` (official PDF receipt)
* `subscribePaymentWebhook(url, signature)` (payment webhooks)

**Suggested flow:**

1. Confirmed on-chain → make **PIX-like receipt** available.
2. If **ENABLE_PIX_SETTLEMENT=true** → call `newPixPayment(...)` and wait for `settled` webhook.
3. Display **"Download official PDF"** button when available (`/api/transfero/receipt/[paymentId]`).

> **Plan B**: if credentials are not available in time, keep button visible with **"(coming soon)"** label and register stub in code.

---

## 📋 User Stories (Brazil)

1. **As a merchant**, I want to create a charge by voice/chat to receive a **QR** in up to **5s**.
2. **As a merchant**, I want to see **confirmation** and issue **receipt** with **txid** to send to customer.
3. **As a merchant**, I want to **export daily CSV** to reconcile in my system.

---

## 🔗 Edge Functions (Supabase)

* `GET /validate-payment`

  * Searches signature by `reference` and **validates** (recipient, amount, **BRZ mint**, reference).
  * When validated, calls `app.mark_confirmed(ref, txHash)` and responds `{ status:'confirmed', tx }`.
  * Direct integration with Supabase RPC functions.

* `POST /settlement-webhook`

  * Single webhook entry point. Routes by `SETTLEMENT_PROVIDER`.
  * Validates **signature/HMAC** (when available) and calls `app.mark_settled(ref)`.

* `GET /get-receipt-pdf/:paymentId`

  * Official **PDF** proxy (when provider supports it). Otherwise returns 501.
  * Direct access to Supabase Storage.

* `GET /export-csv`

  * Exports CSV using SQL function or SELECT.
  * Direct query to database via Service Role.

### Voice (OpenAI Realtime)

To enable push-to-talk voice (STT + LLM + TTS) without exposing your API key, use the included Edge Function `openai-realtime-token`.

1) Configure Edge Functions env (local or dashboard):

```env
# supabase/functions/.env
OPENAI_API_KEY=sk-...
# Optional overrides
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview-2024-12-17
OPENAI_REALTIME_VOICE=verse

# Optional: local Supabase aliases (avoid conflicts with other tooling)
SUPABASE_LOCAL_URL=http://127.0.0.1:54321
SUPABASE_LOCAL_SERVICE_ROLE_KEY=...
```

2) Serve locally and test:

```bash
npx supabase functions serve --env-file supabase/functions/.env --no-verify-jwt
curl -X POST http://127.0.0.1:54321/functions/v1/openai-realtime-token -H "Content-Type: application/json" -d '{}'
```

3) Frontend usage:

Render `<VoiceInput />` (already included) or add the mic button in the header (already wired in `HeaderBar.tsx`). The component fetches an ephemeral token and opens a Realtime session.

Notes:
- Do not prefix envs with `SUPABASE_` (the runtime ignores them).
- After changing envs, restart `functions serve` or redeploy.

### Edge Functions Deploy

```bash
# Deploy individual
supabase functions deploy validate-payment

# Deploy all
supabase functions deploy
```

> **Advantages:** Zero cold start, native Supabase integration, global CDN, automatic Service Role.

---

## 🧭 Flow (Brazil vs Global)

### Brazil (Real PIX when enabled)

1. POS → creates invoice (`pending`) and displays **Solana Pay QR** (BRZ by default).
2. Customer pays → server validates on-chain → `confirmed` (**PIX-like receipt** available).
3. Optional **Settle via PIX** (Transfero provider) → `settled` webhook → **official PDF** button.

### Global (PIX-like experience)

1. POS accepts **SOL/any SPL**; optional **auto-swap** to **USDC** via Jupiter.
2. `confirmed` → merchant can keep in stable or initiate **off-ramp** via provider (`stripe`/`circle`, depending on country).
3. **PIX-like receipt** always available; "settled to fiat" when provider confirms.

---

## 👛 Wallet UX & Solana Pay

* Deep links for **Phantom / Backpack / Solflare**; fallback "copy link".
* **Timer/Expiration** for QR (5–10min) + "Regenerate".
* **High-contrast** for external use; **thermal-like** print CSS for receipt.

### On-chain Validation

* Unique `reference` per charge.
* `validateTransfer`: check **recipient**, **amount**, **BRZ mint** (or allowed mint), and `reference`.
* Update state via RPC (`mark_confirmed`).

---

## 🧩 Settlement Providers (abstraction)

Create a single server interface:

```ts
export type SettlementProvider = 'mock' | 'transfero' | 'stripe' | 'circle'
export interface SettlementDriver {
  createPayout?(args: { invoiceId: string; amountBRL: number; ... }): Promise<{ paymentId: string }>
  getReceiptPDF?(paymentId: string): Promise<Buffer>
  verifyWebhook?(req: Request): boolean
}
```

Optional drivers in `api/settlement/providers/*`.

* `mock` — always confirms (for demo).
* `transfero` — Brazilian PIX (payout + PDF receipt when available).
* `stripe` — accept **USDC** and settle **USD** (dependent on eligibility/country).
* `circle` — **USDC** ramps to bank account via partners.

> UI **never** shows PSP brand; only "PIX settlement (optional)".

---

## 🔒 Security

* **RLS** on all tables; policies by merchant.
* **Signed webhooks** (HMAC/secret) and **replay protection**.
* **Idempotency** by `reference`/`invoice_id`.
* **Logs/Audit**: save webhook payloads and validation decisions.
* **Privacy**: do not custodial private keys; only deep links/QR.

---

## 🧠 Optional Solana Program

> **Status in MVP**: optional. Default UX uses **SPL transfer via Solana Pay**. When enabled, we use **Transaction Requests** to sign a transaction that **calls our program** (keeping QR/deep link) and applies on-chain logic.

### When to use

* **On-chain audit** (immutable logs/events per sale).
* **Automatic split** (commission/tip/donation) at payment time.
* **Escrow/hold** with scheduled release.
* **Per-store policies** (mint whitelist, minimum value, fee bps).
* **Controlled refund** and **loyalty/NFT** (points/receipt NFT).

### Program design (Anchor)

* **Name**: `merchant_checkout`
* **Accounts (PDAs)**

  * `Merchant { owner, allowed_mint (BRZ), fee_bps, fee_account }`
  * *(Optional)* `Sale` (or just **events** to reduce state).
* **Instructions**

  1. `register_merchant(owner, fee_bps, fee_account)`
  2. `pay_sale(payer, merchant, mint=BRZ, amount, reference)` → verifies mint/value/ref; **CPI** in **SPL Token** to transfer BRZ; applies **fee**; `emit!(SalePaid{...})`.
  3. *(Optional)* `refund_sale(...)`

#### Skeleton (summarized)

```rust
#[event]
pub struct SalePaid { pub merchant: Pubkey, pub payer: Pubkey, pub mint: Pubkey, pub amount: u64, pub fee: u64, pub reference: Pubkey }

pub fn pay_sale(ctx: Context<PaySale>, amount: u64, reference: Pubkey) -> Result<()> {
    require!(amount > 0, CustomError::InvalidAmount);
    require_keys_eq!(ctx.accounts.mint.key(), ctx.accounts.merchant.allowed_mint, CustomError::WrongMint);
    let fee = amount.saturating_mul(ctx.accounts.merchant.fee_bps as u64) / 10_000;
    let to_merchant = amount.saturating_sub(fee);
    // CPI transfer to merchant_ata
    // CPI transfer fee -> fee_ata (if fee > 0)
    emit!(SalePaid{ merchant: ctx.accounts.merchant.key(), payer: ctx.accounts.payer.key(), mint: ctx.accounts.mint.key(), amount, fee, reference });
    Ok(())
}
```

### Solana Pay Integration

* **Default mode**: *Simple transfer* (maximum wallet compatibility).
* **Advanced mode**: *Transaction Request* → backend builds transaction with `pay_sale` + CPIs; wallet signs/queues.
* **Automatic fallback**: if wallet doesn't support `transaction request`, fall back to *simple transfer*.

### Flags & Env (example)

```env
VITE_USE_CONTRACT=false
PROGRAM_ID=Merchxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📈 Reports & CSV

* `/reports`: KPIs (Total R$, Tx count, Avg ticket, % settled) + mini-graphs.
* Daily CSV via Edge Function `/export-csv` or dedicated SQL function.

---

## 🎬 Submissions (Global + Brazil)

**Colosseum (Global)**

* Name, one-liner, logo
* Links: **repo**, **demo**, **pitch video (≤3min)**, **technical video (≤3min)**
* Team (Brazil), networks, eligibility declarations

**Superteam Earn (Brazil Side Track)**

* Register after Colosseum submission, with same links

**Video scripts**

* *Pitch*: problem → solution (short demo) → why now (Solana + PIX) → market → model → roadmap.
* *Technical*: architecture (Vite/Supabase/RLS/API), on-chain validation, settlement abstraction, optional program.

---

## 🗺️ Roadmap (until end of October)

* **Week 1**: Multi-wallet UX + expiration + thermal-print; Edge Function `/validate-payment` with `validateTransfer` (BRZ)
* **Week 2**: `SettlementProvider` (`mock` first; `transfero` when credentials arrive); Edge Function `/settlement-webhook` with HMAC
* **Week 3**: Solana program via Transaction Request (split + event); TTF-QR/Confirm metrics
* **Week 4**: polish, videos, landing, filmed pilots

---

## 🧪 Test Plan (MVP)

1. Create account → default merchant created → Settings reflects
2. POS generates charge → `invoices.pending` appears in **Receipts** (via VIEW)
3. Call Edge Function `/validate-payment?reference=...` → changes to **confirmed** (realtime)
4. POST to Edge Function `/settlement-webhook` (mock) → **settled**; **PDF** button enables (mock/real)
5. User B doesn't see merchant A data (RLS ok)

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🙌 Acknowledgments

* Solana community and hackathon organizers
* Transfero (BRZ/BRL) for ecosystem and on/off-ramp APIs
* Lovable.dev for development platform
* OSS tools that make this project possible
