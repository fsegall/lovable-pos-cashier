# Scope Guide — Cypherpunk (Global + Brazil)

**Project:** Merchant AI Checkout (Solana "PIX-like" + Global Settlement)
**Objective:** a PWA POS that accepts crypto (Solana Pay) with **immediate PIX-like on-chain receipt** and **optional local currency settlement** (ex.: **PIX** in Brazil). Same repository, two submissions: **Colosseum (global)** and **Superteam Brazil (side track)**.

---

## 🎯 TL;DR (what we'll deliver)

* **Counter UX**: value → Solana Pay QR (BRZ/USDC) → **confirmed** → **PIX-like receipt**.
* **Edge Functions (Supabase)**: `validate-payment`, `settlement-webhook`, `get-receipt-pdf`, `export-csv`.
* **Settlement abstraction**: `mock` today; `transfero` (PIX) when credentials arrive; `stripe/circle` for global (roadmap).
* **Secure multi-tenant**: Supabase **RLS** + RPCs (`app.*`).
* **Pitch & demo** in ≤3min: real counter, receipt, (optional) settlement.

---

## 🏆 Victory Strategy (mapped to Colosseum guide)

* **Founder + Market Fit**: Brazilian team creating **"global PIX-like"** on mobile. Domain of **PIX**, **Solana**, **POS UX** and **on/off-ramp**.
* **Insight**: merchants want **familiar receipt** and **stable/fiat optional**. We deliver **PIX-like receipt** + **pluggable settlement**.
* **Product + Execution**: PWA + Supabase (RLS) + **Edge** validating on-chain with `@solana/pay`.
* **Market**: SMEs (fairs, events, services). Global scale via regional settlement drivers.
* **Communication**: 2 clear videos (pitch + technical) and short landing.
* **Viability**: take-rate (0.5-1%) + SaaS per store; low infra costs.

---

## 🧪 Demo "timeline" (what appears in video)

1. **Operator** types R$ 25 → **Generate QR** (Solana Pay with unique `reference`).
2. **Customer** pays via wallet → Edge **`/validate-payment`** confirms → **confirmed** status.
3. **PIX-like receipt**: short txid + tx QR + **thermal** style print.
4. **(Optional)** **Settle**: triggers provider → **webhook** → **settled** status + official **PDF** (when available).
5. **Dashboard** shows KPIs (Total, Transactions, Average ticket, % settled).

---

## 🏗️ Architecture (summary)

* **Frontend**: Vite + React + TypeScript + Tailwind (shadcn/ui), PWA, i18n EN/pt-BR, dark mode.
* **Data & Auth**: Supabase (Postgres + **RLS** + Realtime), migrations with `merchants`, `products`, `invoices`, `payments` and **VIEW `receipts`**.
* **Edge Functions (Deno)**:

  * `validate-payment`: `@solana/pay` (`findTransactionSignature` + `validateTransfer`), writes `confirmed` via RPC.
  * `settlement-webhook`: validates HMAC and marks `settled`.
  * `get-receipt-pdf`: PDF proxy (ex.: Transfero OAuth).
  * `export-csv`: daily CSV under user RLS.
* **Settlement Abstraction**: `SettlementProvider` interface (`mock` | `transfero` | `stripe` | `circle`). UI never shows PSP brand; only "PIX settlement (optional)".

---

## ⚙️ Endpoints (Edge)

* `POST|GET /validate-payment?reference=...` → responds `{status: pending|confirmed, tx}`.
* `POST /settlement-webhook` → payload `{ reference, paymentId }` (HMAC headers) → marks **settled**.
* `GET /get-receipt-pdf?paymentId=...` → `application/pdf`.
* `GET /export-csv?date=YYYY-MM-DD` → CSV with `created_at,amount_brl,status,ref,tx_hash`.

**Deploy:**

```bash
supabase functions deploy validate-payment --verify-jwt
supabase functions deploy export-csv --verify-jwt
supabase functions deploy settlement-webhook --no-verify-jwt
supabase functions deploy get-receipt-pdf --no-verify-jwt
```

**Minimum secrets (dev):**

```bash
supabase secrets set \
  SUPABASE_URL=... \
  SUPABASE_SERVICE_ROLE_KEY=... \
  SUPABASE_ANON_KEY=... \
  SOLANA_RPC_URL=https://api.mainnet-beta.solana.com \
  MERCHANT_RECIPIENT=<SPL address> \
  BRZ_MINT=FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD \
  DEMO_MODE=true
```

> **Exposed schemas:** `app` in **Settings → API** of Supabase.

---

## 🗃️ Database (core)

* `merchants`, `merchant_members` (RBAC owner/staff, `is_default`).
* `products` (catalog).
* `invoices` (canonical charge, `reference`, `amount_brl`).
* `payments` (method, `confirmed|settled|failed`, `chain_tx`, `pix_payment_id`).
* **VIEW `receipts`** (join of `invoices` + `payments`) → shape that UI consumes.
* **RPCs**: `app.set_default_merchant`, `app.current_merchant`, `app.create_invoice_with_payment` (or `create_receipt`), `app.mark_confirmed`, `app.mark_settled`, `app.update_payment_status`, `app.list_receipts`.

**Realtime:** subscribe to **invoices** and **payments** (views don't emit events).

---

## 📆 Schedule until end of October

### Week A (now)

* [x] Real `validate-payment` with `@solana/pay` (DEMO toggle).
* [ ] Multi-wallet UX (Phantom/Backpack/Solflare) + **QR expiration/regenerate**.
* [ ] **Thermal print CSS** on receipt.

### Week B

* [ ] `SettlementProvider`: `mock` ready; **Transfero** when credentials arrive.
* [ ] Webhook with HMAC (real PSP headers) + functional `/get-receipt-pdf`.
* [ ] (Global) **Jupiter auto-swap** → USDC post-confirmation (slippage guard).

### Week C

* [ ] **Solana Program** (optional): `merchant_checkout` with **fee split** + **`SalePaid` event**.
* [ ] Telemetry: TTF-QR, TTF-Confirm, success rate per wallet; cards in `/reports`.

### Week D

* [ ] UI/UX polish, **landing**, **videos**, 1-2 short filmed **pilots**.

---

## 📣 Build in Public (minimum viable)

* Create X/Twitter project profile.
* Post 1: **GIF** (value→QR→confirmed→receipt).
* Post 2: architecture (Edge + RLS + Solana Pay).
* Post 3: **call for beta testers** (fairs/events).
* Open roadmaps and "good first demo" issues.

---

## 📦 Submission Package (checklist)

* **Name + one-liner**: "Mobile checkout for merchants: Solana payments with optional PIX/fiat settlement."
* **Clean repo** (global README, migrations, `supabase/functions/*`, seed script).
* **Demo URL** (Vercel/Netlify) + deployed Edge Functions.
* **Pitch Video (≤3min)** and **Technical Video (≤3min)**.
* **Team** (Brazil), networks, eligibility declaration.
* **Market**: SMEs in BR → expandable global with regional drivers.
* **GTM/Model**: early niches, take-rate + SaaS.

---

## 🎬 Video Scripts (teleprompter)

### 1) Pitch (≤3min)

* "We're from Brazil, where **PIX** became standard. We bring **PIX-like experience on Solana** to the counter."
* "See: I type R$25 → QR → confirmed → **PIX-like receipt**."
* "If you want, **settle in BRL (PIX)**; abroad, **auto-swap to USDC** and off-ramp."
* "Stack: **PWA**, **Supabase RLS**, **Edge Functions**, **@solana/pay**."
* "Market & model: SMEs, fee per transaction + SaaS; roadmap: program for split/loyalty and regional drivers."

### 2) Technical (≤3min)

* Architecture (Vite/React, Supabase, Edge Functions).
* Flow `reference` → `validateTransfer` (recipient/amount/mint).
* `SettlementProvider` (+ webhook HMAC) and **PDF**.
* (Optional) On-chain program with `SalePaid`.

---

## ✨ Quick differentiators that score points

* **Receipt sharing** (WhatsApp) and **daily CSV**.
* **Terminal Mode** (roadmap: APK + printers).
* **Fail-safe**: if wallet doesn't support tx request/program, falls back to **SPL transfer** validated by `reference`.

---

## ⚠️ Risks & Mitigations

* **PSP credentials** delay → use `mock` + leave "(coming soon)" label on PDF.
* **On-chain validation** in Deno: already covered with `@solana/pay`; keep `DEMO_MODE` as local fallback.
* **Regulatory/off-ramp**: non-custodial; merchant connects their provider; UI without brands.

---

## ✅ DoD (Definition of Done) — MVP

* Create charge → **confirmed** in ≤10s (real or DEMO) with real-time update.
* **PIX-like receipt** with **thermal** print.
* Webhook (mock/real) changes to **settled**; **PDF** route responds.
* RLS proven (user B doesn't see A's data).
* Installable and stable PWA on mobile.

---

## 🔧 ENV Reference

**Client (`.env.local`)**

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_DEMO_MODE=true
VITE_SOLANA_CLUSTER=mainnet-beta
VITE_BRZ_MINT=FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD
```

**Functions (secrets)**

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
MERCHANT_RECIPIENT=<SPL address>
BRZ_MINT=FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD
WEBHOOK_SECRET=<hmac>
TRANSFERO_BASE_URL=https://staging-openbanking.bit.one/
TRANSFERO_CLIENT_ID=...
TRANSFERO_CLIENT_SECRET=...
TRANSFERO_ACCOUNT_ID=...
DEMO_MODE=true
```

---

## 📈 Metrics for video/demo

* **TTF-QR** (time to display QR)
* **TTF-Confirm** (time to confirm on-chain)
* **Success rate per wallet** (Phantom/Backpack/Solflare)
* **% Settled** (when settlement enabled)

---

## 🙌 Credits & Community

* Solana/Colosseum, Superteam Brazil, Transfero & partners
* Lovable.dev and OSS

> This guide is the "scope contract" of the project until submissions. Update progress in weekly checkboxes and use as video recording script.
