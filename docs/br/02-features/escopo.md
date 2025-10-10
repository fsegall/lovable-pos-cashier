# Guia de Escopo — Cypherpunk (Global + Brasil)

**Projeto:** Merchant AI Checkout (Solana “PIX‑like” + Settlement Global)
**Objetivo:** uma PWA POS que aceita cripto (Solana Pay) com **recibo PIX‑like on‑chain** imediato e **liquidação opcional em moeda local** (ex.: **PIX** no Brasil). Mesmo repositório, duas submissões: **Colosseum (global)** e **Superteam Brazil (side track)**.

---

## 🎯 TL;DR (o que vamos entregar)

* **UX de balcão**: valor → QR Solana Pay (BRZ/USDC) → **confirmado** → **recibo PIX‑like**.
* **Edge Functions (Supabase)**: `validate-payment`, `settlement-webhook`, `get-receipt-pdf`, `export-csv`.
* **Abstração de settlement**: `mock` hoje; `transfero` (PIX) quando credenciais chegarem; `stripe/circle` para global (roadmap).
* **Multi‑tenant seguro**: Supabase **RLS** + RPCs (`app.*`).
* **Pitch & demo** em ≤3min: balcão real, comprovante, (opcional) liquidação.

---

## 🏆 Estratégia de Vitória (mapeada ao guia da Colosseum)

* **Founder + Market Fit**: time BR criando o **“PIX‑like global”** no celular. Domínio de **PIX**, **Solana**, **UX** de PDV e **on/off-ramp**.
* **Insight**: comerciantes querem **comprovante familiar** e **stable/fiat opcional**. Entregamos recibo **PIX‑like** + **liquidação** plugável.
* **Produto + Execução**: PWA + Supabase (RLS) + **Edge** validando on‑chain com `@solana/pay`.
* **Mercado**: PMEs (feiras, eventos, serviços). Escala global via drivers regionais de settlement.
* **Comunicação**: 2 vídeos claros (pitch + técnico) e landing curta.
* **Viabilidade**: take‑rate (0,5–1%) + SaaS por loja; custos de infra baixos.

---

## 🧪 Demo “linha do tempo” (o que aparece no vídeo)

1. **Operador** digita R$ 25 → **Gerar QR** (Solana Pay com `reference` único).
2. **Cliente** paga pela wallet → Edge **`/validate-payment`** confirma → status **confirmed**.
3. **Recibo PIX‑like**: txid curto + QR da tx + print estilo **thermal**.
4. **(Opcional)** **Liquidar**: dispara provider → **webhook** → status **settled** + **PDF** oficial (quando houver).
5. **Painel** mostra KPIs (Total, Transações, Ticket médio, % settled).

---

## 🏗️ Arquitetura (resumo)

* **Frontend**: Vite + React + TypeScript + Tailwind (shadcn/ui), PWA, i18n EN/pt‑BR, dark mode.
* **Dados & Auth**: Supabase (Postgres + **RLS** + Realtime), migrations com `merchants`, `products`, `invoices`, `payments` e **VIEW `receipts`**.
* **Wallet UX (Diferencial)**:
  * **Tradicional**: Solana Wallet Adapter (Phantom, Solflare) para usuários crypto-native
  * **Passkey/Embedded**: Phantom Embedded Wallets ou Web3Auth para onboarding sem seed phrase
  * **Login social**: Google/Apple/Email → wallet MPC automática
  * **Zero friction**: biometria em vez de 12 palavras
* **Edge Functions (Deno)**:

  * `validate-payment`: `@solana/pay` (`findTransactionSignature` + `validateTransfer`), grava `confirmed` via RPC.
  * `settlement-webhook`: valida HMAC e marca `settled`.
  * `get-receipt-pdf`: proxy de PDF (ex.: Transfero OAuth).
  * `export-csv`: CSV diário sob RLS do usuário.
* **Abstração Settlement**: interface `SettlementProvider` (`mock` | `transfero` | `stripe` | `circle`). UI nunca mostra marca do PSP; apenas "PIX settlement (opcional)".

---

## ⚙️ Endpoints (Edge)

* `POST|GET /validate-payment?reference=...` → responde `{status: pending|confirmed, tx}`.
* `POST /settlement-webhook` → payload `{ reference, paymentId }` (headers com HMAC) → marca **settled**.
* `GET /get-receipt-pdf?paymentId=...` → `application/pdf`.
* `GET /export-csv?date=YYYY-MM-DD` → CSV com `created_at,amount_brl,status,ref,tx_hash`.

**Deploy:**

```bash
supabase functions deploy validate-payment --verify-jwt
supabase functions deploy export-csv --verify-jwt
supabase functions deploy settlement-webhook --no-verify-jwt
supabase functions deploy get-receipt-pdf --no-verify-jwt
```

**Secrets mínimos (dev):**

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

> **Exposed schemas:** `app` em **Settings → API** do Supabase.

---

## 🗃️ Banco de Dados (core)

* `merchants`, `merchant_members` (RBAC owner/staff, `is_default`).
* `products` (catálogo).
* `invoices` (cobrança canônica, `reference`, `amount_brl`).
* `payments` (método, `confirmed|settled|failed`, `chain_tx`, `pix_payment_id`).
* **VIEW `receipts`** (join de `invoices` + `payments`) → shape que a UI consome.
* **RPCs**: `app.set_default_merchant`, `app.current_merchant`, `app.create_invoice_with_payment` (ou `create_receipt`), `app.mark_confirmed`, `app.mark_settled`, `app.update_payment_status`, `app.list_receipts`.

**Realtime:** assinar **invoices** e **payments** (views não emitem eventos).

---

## 📆 Cronograma até o fim de outubro

### Semana A (agora)

* [x] `validate-payment` real com `@solana/pay` (DEMO toggle).
* [ ] UX multi‑wallet (Phantom/Backpack/Solflare) + **expiração/regenerar QR**.
* [ ] **Print CSS thermal** no recibo.

### Semana B

* [ ] `SettlementProvider`: `mock` pronto; **Transfero** quando credenciais chegarem.
* [ ] Webhook com HMAC (headers reais do PSP) + `/get-receipt-pdf` funcional.
* [ ] (Global) **auto‑swap Jupiter** → USDC pós‑confirmação (slippage guard).

### Semana C

* [ ] **Programa Solana** (opcional): `merchant_checkout` com **split de taxa** + **evento `SalePaid`**.
* [ ] Telemetria: TTF‑QR, TTF‑Confirm, success rate por wallet; cards em `/reports`.

### Semana D

* [ ] Polimento UI/UX, **landing**, **vídeos**, 1–2 **pilotos** curtos filmados.

---

## 📣 Build in Public (mínimo viável)

* Criar perfil X/Twitter do projeto.
* Post 1: **GIF** (valor→QR→confirmado→recibo).
* Post 2: arquitetura (Edge + RLS + Solana Pay).
* Post 3: **call for beta testers** (feiras/eventos).
* Abrir roadmaps e issues “good first demo”.

---

## 📦 Pacote de Submissão (checklist)

* **Nome + one‑liner**: “Mobile checkout for merchants: Solana payments with optional PIX/fiat settlement.”
* **Repo** limpo (README global, migrations, `supabase/functions/*`, seed script).
* **Demo URL** (Vercel/Netlify) + Edge Functions implantadas.
* **Vídeo Pitch (≤3min)** e **Vídeo Técnico (≤3min)**.
* **Equipe** (Brasil), redes, declaração de elegibilidade.
* **Mercado**: PMEs no BR → expandível global com drivers regionais.
* **GTM/Modelo**: nichos early, take‑rate + SaaS.

---

## 🎬 Roteiros de Vídeo (teleprompter)

### 1) Pitch (≤3min)

* “Somos do Brasil, onde o **PIX** virou padrão. Trazemos a **experiência PIX‑like na Solana** para o balcão.”
* “Veja: digito R$25 → QR → confirmado → **recibo PIX‑like**.”
* “Se quiser, **liquida em BRL (PIX)**; no exterior, **auto‑swap p/ USDC** e off‑ramp.”
* “Stack: **PWA**, **Supabase RLS**, **Edge Functions**, **@solana/pay**.”
* “Mercado & modelo: PMEs, fee por transação + SaaS; roadmap: programa para split/loyalty e drivers regionais.”

### 2) Técnico (≤3min)

* Arquitetura (Vite/React, Supabase, Edge Functions).
* Fluxo `reference` → `validateTransfer` (recipient/amount/mint).
* `SettlementProvider` (+ webhook HMAC) e **PDF**.
* (Opcional) Programa on‑chain com `SalePaid`.

---

## ✨ Diferenciais rápidos que contam pontos

* **Share** de recibo (WhatsApp) e **CSV diário**.
* **Modo Maquininha** (roadmap: APK + impressoras).
* **Fail‑safe**: se wallet não suporta tx request/program, cai em **transfer SPL** validada por `reference`.

---

## ⚠️ Riscos & Mitigações

* **Credenciais PSP** demorarem → usar `mock` + deixar rótulo “(em breve)” no PDF.
* **Validação on‑chain** em Deno: já cobrimos com `@solana/pay`; manter `DEMO_MODE` como fallback local.
* **Regulatório/off‑ramp**: não‑custodial; lojista conecta seu provedor; UI sem marcas.

---

## ✅ DoD (Definition of Done) — MVP

* Criar cobrança → **confirmed** em ≤10s (real ou DEMO) com atualização em tempo real.
* Recibo **PIX‑like** com print **thermal**.
* Webhook (mock/real) muda para **settled**; rota de **PDF** responde.
* RLS comprovada (usuário B não vê dados do A).
* PWA instalável e estável em mobile.

---

## 🔧 Referência de ENV

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

## 🔑 Passkey/Embedded Wallets (Diferencial Competitivo)

### Por que isso importa?
**Problema:** Seed phrases de 12 palavras assustam usuários não-técnicos e são a #1 barreira de adoção crypto.

**Solução:** Passkeys/Embedded Wallets com login social.

### Opções de Implementação

#### 1. Phantom Embedded Wallets (MPC)
```typescript
import { PhantomEmbeddedProvider } from '@phantom-labs/embedded-wallet';

const provider = new PhantomEmbeddedProvider({
  appId: 'your-phantom-app-id', // Registrar em phantom.app/developers
});

// Login com Google/Apple/Email
await provider.login('google');
// Wallet MPC criada automaticamente, sem seed phrase!
```

**Benefícios:**
- ✅ Zero install (funciona no navegador)
- ✅ Login social (Google/Apple/Email)
- ✅ Biometria (Face ID/Touch ID)
- ✅ MPC não-custodial (chave dividida)
- 🔗 **Docs:** https://phantom.app/learn/blog/introducing-phantom-embedded-wallets

#### 2. Web3Auth (Multi-Provider)
```bash
npm install @web3auth/modal @web3auth/solana-provider
```

**Benefícios:**
- ✅ 15+ métodos de login (Google, Facebook, Twitter, Discord, SMS, Email)
- ✅ WebAuthn/Passkey nativo
- ✅ Multi-chain (Solana, Ethereum, etc)
- ✅ Customizável
- 🔗 **Docs:** https://web3auth.io/docs/sdk/pnp/web/solana

#### 3. Magic (ex-Magic Link)
```bash
npm install magic-sdk @magic-sdk/solana
```

**Benefícios:**
- ✅ Email magic links (passwordless)
- ✅ SMS OTP
- ✅ Social login
- ✅ WebAuthn/Passkeys
- 🔗 **Docs:** https://magic.link/docs/solana

### Roadmap de Implementação

**Semana C (20-26 OUT):**
- [ ] Registrar app no Phantom Developers
- [ ] Integrar Phantom Embedded Wallets
- [ ] Adicionar botão "Login with Google" no header
- [ ] Testar fluxo: Google login → auto-create wallet → fazer pagamento
- [ ] Documentar no README

**UX Final:**
- **Crypto-native users:** "Connect Wallet" (Phantom extension)
- **New users:** "Login with Google" (embedded wallet, sem extension)
- **Ambos:** mesma experiência de pagamento depois do login!

---

## 📈 Métricas para o vídeo/demo

* **TTF‑QR** (tempo até exibir o QR)
* **TTF‑Confirm** (tempo até confirmar on‑chain)
* **Taxa de sucesso por wallet** (Phantom/Backpack/Solflare)
* **% Settled** (quando settlement ligado)
* **🆕 Onboarding time** (tradicional vs passkey)
  - Wallet tradicional: ~5 min (install extension + criar wallet + backup seed)
  - Passkey/Embedded: ~30s (login Google + biometria) ⚡

---

## 🙌 Créditos & Comunidade

* Solana/Colosseum, Superteam Brazil, Transfero & parceiros
* Lovable.dev e OSS

> Este guia é o “contrato de escopo” do projeto até as submissões. Atualize o progresso em checkboxes semanais e use como script de gravação dos vídeos.
