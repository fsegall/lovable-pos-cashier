# 🧩 Wise Adapter — Snippets Consolidados
*Atualizado:* 2025-10-08

> Cole este conteúdo no repo (ex.: `docs/WISE_ADAPTER.md`) para ter **tudo** que precisa do driver Wise em um lugar só: endpoints, envs, tipos, snippets TS, cURLs e plano de teste. Mantém nosso padrão **BigInt/minor units** e **idempotência**.

---

## 🔧 Variáveis de Ambiente

```bash
# Wise
WISE_API_BASE=https://api.sandbox.transferwise.tech   # sandbox (trocar p/ prod depois)
WISE_API_TOKEN=...                                     # bearer token
WISE_PROFILE_ID=...                                    # business/personal profile
WISE_WEBHOOK_SECRET=...                                # se habilitar assinatura

# App
OFFRAMP_PROVIDER=wise
```

---

## 🗂️ Organização sugerida dos arquivos

```
core/
  offramp/
    wise/
      quote.ts
      recipient.ts
      recipient-usd.ts
      transfer.ts
      index.ts
supabase/
  functions/
    wise-payout/
    settlement-webhook/
docs/
  WISE_ADAPTER.md  ← este arquivo
```

---

## 🧱 Tipos base (TS)

```ts
// core/offramp/wise/types.ts
export type WiseQuote = {
  id: string
  sourceCurrency: string
  targetCurrency: string
  sourceAmount?: number | null
  targetAmount?: number | null
  preferredPayIn?: 'BANK_TRANSFER' | 'BALANCE'
  payOut?: 'BANK_TRANSFER' | 'BALANCE' | 'SWIFT' | 'SWIFT_OUR' | 'INTERAC'
  rate?: number
  rateType?: 'FIXED' | 'FLOATING'
  rateExpirationTime?: string
  providedAmountType?: 'SOURCE' | 'TARGET'
  paymentOptions?: any[]
  status?: 'PENDING' | 'ACCEPTED' | 'FUNDED' | 'EXPIRED'
  expirationTime?: string
}

export type WiseTransfer = {
  id: number
  targetAccount: number
  quoteUuid?: string | null
  status: string
  details?: { reference?: string } | null
  sourceCurrency?: string
  sourceValue?: number
  targetCurrency?: string
  targetValue?: number
  customerTransactionId?: string
  created?: string
}
```

---

## 🔐 Helpers (auth)

```ts
// core/offramp/wise/http.ts
const BASE = process.env.WISE_API_BASE!
const TOKEN = process.env.WISE_API_TOKEN!

export function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...(extra ?? {}) }
}

export async function httpJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`[Wise] HTTP {{status:${res.status}}} {{text:${res.statusText}}} {{body:${body}}}`)
  }
  return res.json() as Promise<T>
}
```

---

## 💱 Quote (create / patch / get)

```ts
// core/offramp/wise/quote.ts
import { authHeaders, httpJson } from './http'
import type { WiseQuote } from './types'

/** POST /v3/profiles/{{profileId}}/quotes — authenticated quote */
export async function createQuote(input: {
  profileId: number | string
  sourceCurrency: string
  targetCurrency: string
  sourceAmountMinor?: bigint  // preferir SOURCE (minor units, 2 casas se BRL/USD)
  targetAmountMinor?: bigint
  preferredPayIn?: 'BANK_TRANSFER' | 'BALANCE'
  payOut?: 'BANK_TRANSFER' | 'BALANCE' | 'SWIFT' | 'SWIFT_OUR' | 'INTERAC'
  transferNature?: string // BRL: obrigatório para IOF correto
  pricingConfiguration?: { fee: { type: 'OVERRIDE'; variable?: number; fixed?: number } }
}): Promise<WiseQuote> {
  const body: any = {
    sourceCurrency: input.sourceCurrency,
    targetCurrency: input.targetCurrency,
    preferredPayIn: input.preferredPayIn ?? 'BALANCE',
    payOut: input.payOut ?? 'BANK_TRANSFER',
    paymentMetadata: input.transferNature ? { transferNature: input.transferNature } : undefined,
    pricingConfiguration: input.pricingConfiguration,
  }
  if (input.sourceAmountMinor && !input.targetAmountMinor) {
    body.sourceAmount = Number(input.sourceAmountMinor) / 100 // BRL/USD: 2 casas (Wise espera decimal)
  } else if (!input.sourceAmountMinor && input.targetAmountMinor) {
    body.targetAmount = Number(input.targetAmountMinor) / 100
  } else {
    throw new Error('Provide exactly one: sourceAmountMinor OR targetAmountMinor')
  }

  return httpJson<WiseQuote>(
    `${process.env.WISE_API_BASE}/v3/profiles/${input.profileId}/quotes`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) },
  )
}

/** PATCH /v3/profiles/{{profileId}}/quotes/{{quoteId}} — set recipient / payout */
export async function patchQuoteRecipient(input: {
  profileId: number | string
  quoteId: string
  targetAccountId: number
  payOut?: 'BANK_TRANSFER' | 'BALANCE' | 'SWIFT' | 'SWIFT_OUR' | 'INTERAC'
  transferNature?: string
}) {
  const body: any = {
    targetAccount: input.targetAccountId,
    payOut: input.payOut ?? 'BANK_TRANSFER',
    paymentMetadata: input.transferNature ? { transferNature: input.transferNature } : undefined,
  }
  return httpJson<WiseQuote>(
    `${process.env.WISE_API_BASE}/v3/profiles/${input.profileId}/quotes/${input.quoteId}`,
    { method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/merge-patch+json' }, body: JSON.stringify(body) },
  )
}

/** GET /v3/profiles/{{profileId}}/quotes/{{quoteId}} */
export async function getQuote(profileId: number | string, quoteId: string) {
  return httpJson<WiseQuote>(
    `${process.env.WISE_API_BASE}/v3/profiles/${profileId}/quotes/${quoteId}`,
    { headers: authHeaders() },
  )
}
```

**cURL (exemplo autenticado):**
```bash
curl -X POST "$WISE_API_BASE/v3/profiles/$WISE_PROFILE_ID/quotes"   -H "Authorization: Bearer $WISE_API_TOKEN" -H "Content-Type: application/json"   -d '{
    "sourceCurrency":"BRL","targetCurrency":"BRL",
    "sourceAmount": 125.00,
    "preferredPayIn":"BALANCE","payOut":"BANK_TRANSFER",
    "paymentMetadata":{"transferNature":"MOVING_MONEY_BETWEEN_OWN_ACCOUNTS"}
  }'
```

---

## 👤 Recipient — Pix (BRL) e USD (ACH/SWIFT)

### Pix (conceito)
- `POST /v1/accounts` com `currency: "BRL"`
- `type`: `"pix"` ou `"cpf_cnpj"` (varia por rota; checar account-requirements)
- `details`: `{ taxId, pixKey, ... }`

```ts
// core/offramp/wise/recipient.ts
import { authHeaders, httpJson } from './http'

export async function ensureRecipientPix(input: {
  profileId: number | string
  fullName: string
  cpf: string
  pixKey: string // chave (email, phone, EVP)
  ownedByCustomer?: boolean
}) {
  // (Opcional) listar e tentar casar: GET /v2/accounts?profileId=&currency=BRL
  // ... omitido por brevidade

  const body = {
    currency: 'BRL',
    type: 'pix', // ajustar conforme requirements
    profile: Number(input.profileId),
    ownedByCustomer: Boolean(input.ownedByCustomer ?? true),
    accountHolderName: input.fullName,
    details: {
      legalType: 'PRIVATE',
      taxId: input.cpf,
      pixKey: input.pixKey,
    },
  }
  return httpJson<any>(
    `${process.env.WISE_API_BASE}/v1/accounts`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) },
  )
}
```

### USD — ACH (EUA) e SWIFT (internacional)

```ts
// core/offramp/wise/recipient-usd.ts
type USDRecipientInputACH = {
  profileId: number | string
  fullName: string
  countryCode: 'US'
  accountNumber: string
  routingNumber: string // ABA
  accountType: 'CHECKING' | 'SAVINGS'
  address: { firstLine: string; city: string; stateCode: string; postCode: string }
  ownedByCustomer?: boolean
}

type USDRecipientInputSWIFT = {
  profileId: number | string
  fullName: string
  countryCode: string // ex: 'GB', 'CA'
  swiftCode: string
  ibanOrAccountNumber: string
  bankCountryCode?: string
  address?: { firstLine: string; city: string; stateCode?: string; postCode?: string }
  ownedByCustomer?: boolean
}

export type USDRecipientInput = USDRecipientInputACH | USDRecipientInputSWIFT

const isACH = (i: USDRecipientInput): i is USDRecipientInputACH => (i as any).countryCode === 'US'

export async function ensureRecipientUSD(input: USDRecipientInput) {
  const body = isACH(input)
    ? {
        currency: 'USD',
        type: 'aba',
        profile: Number(input.profileId),
        ownedByCustomer: Boolean(input.ownedByCustomer ?? false),
        accountHolderName: input.fullName,
        details: {
          legalType: 'PRIVATE',
          accountType: input.accountType,
          accountNumber: input.accountNumber,
          routingNumber: input.routingNumber,
          address: {
            country: 'US',
            firstLine: input.address.firstLine,
            city: input.address.city,
            stateCode: input.address.stateCode,
            postCode: input.address.postCode,
          },
        },
      }
    : {
        currency: 'USD',
        type: 'swift_code',
        profile: Number(input.profileId),
        ownedByCustomer: Boolean(input.ownedByCustomer ?? false),
        accountHolderName: input.fullName,
        details: {
          legalType: 'PRIVATE',
          swiftCode: input.swiftCode,
          ...(input.ibanOrAccountNumber.length > 20
            ? { iban: input.ibanOrAccountNumber }
            : { accountNumber: input.ibanOrAccountNumber }),
          ...(input.bankCountryCode ? { bankCountryCode: input.bankCountryCode } : {}),
          ...(input.address
            ? {
                address: {
                  country: input.countryCode,
                  firstLine: input.address.firstLine,
                  city: input.address.city,
                  ...(input.address.stateCode ? { stateCode: input.address.stateCode } : {}),
                  ...(input.address.postCode ? { postCode: input.address.postCode } : {}),
                },
              }
            : {}),
        },
      }

  return httpJson<any(
    )>(`${process.env.WISE_API_BASE}/v1/accounts`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) },
  )
}
```

---

## 💸 Transfer & Funding

```ts
// core/offramp/wise/transfer.ts
import { randomUUID } from 'crypto'
import { authHeaders, httpJson } from './http'
import type { WiseTransfer } from './types'

/** POST /v1/transfers — criar transfer a partir do quote */
export async function createTransfer(input: {
  quoteUuid: string
  targetAccount: number
  reference?: string
  // BRL: inclua transferNature para não travar no processamento
  transferNature?: string // 'MOVING_MONEY_BETWEEN_OWN_ACCOUNTS', etc.
  transferPurpose?: string
  transferPurposeSubTransferPurpose?: string
  sourceOfFunds?: string
  sourceOfFundsOther?: string
  customerTransactionId?: string // idempotência
}): Promise<WiseTransfer> {
  const idempotentId = input.customerTransactionId ?? randomUUID()
  const body: any = {
    targetAccount: input.targetAccount,
    quoteUuid: input.quoteUuid,
    customerTransactionId: idempotentId,
    details: {
      reference: input.reference ?? 'Settlement',
      transferNature: input.transferNature,
      transferPurpose: input.transferPurpose,
      transferPurposeSubTransferPurpose: input.transferPurposeSubTransferPurpose,
      sourceOfFunds: input.sourceOfFunds,
      sourceOfFundsOther: input.sourceOfFundsOther,
    },
  }
  return httpJson<WiseTransfer>(
    `${process.env.WISE_API_BASE}/v1/transfers`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) },
  )
}

/** POST /v3/profiles/{{profileId}}/transfers/{{transferId}}/payments — funding via Balance */
export async function fundTransfer(profileId: number | string, transferId: number) {
  return httpJson<{ type: string; status: 'COMPLETED' | 'REJECTED'; errorCode?: string | null }>(
    `${process.env.WISE_API_BASE}/v3/profiles/${profileId}/transfers/${transferId}/payments`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify({ type: 'BALANCE' }) },
  )
}

/** GET /v1/transfers/{{id}} */
export async function getTransferById(transferId: number | string) {
  return httpJson<WiseTransfer>(
    `${process.env.WISE_API_BASE}/v1/transfers/${transferId}`,
    { headers: authHeaders() },
  )
}
```

**cURL (create + fund):**
```bash
# Create transfer
curl -X POST "$WISE_API_BASE/v1/transfers"   -H "Authorization: Bearer $WISE_API_TOKEN" -H "Content-Type: application/json"   -d '{
    "targetAccount": 1234567,
    "quoteUuid": "8fa9be20-ba43-4b15-abbb-9424e1481050",
    "customerTransactionId": "INV-REF-001",
    "details": { "reference": "Invoice 001", "transferNature": "MOVING_MONEY_BETWEEN_OWN_ACCOUNTS" }
  }'

# Fund (BALANCE)
curl -X POST "$WISE_API_BASE/v3/profiles/$WISE_PROFILE_ID/transfers/16521632/payments"   -H "Authorization: Bearer $WISE_API_TOKEN" -H "Content-Type: application/json"   -d '{ "type": "BALANCE" }'
```

---

## 🧪 Transfer Requirements (dinâmico — opcional mas recomendado)

Use para descobrir campos condicionais (ex.: `sourceOfFunds`, `transferPurpose`, limites do `reference`).

```ts
// core/offramp/wise/requirements.ts
import { authHeaders, httpJson } from './http'

export async function getTransferRequirements(input: {
  targetAccount: number
  quoteUuid: string
  originatorLegalEntityType?: 'PRIVATE' | 'BUSINESS'
  details?: Record<string, any>
  customerTransactionId?: string
}) {
  const body: any = {
    targetAccount: input.targetAccount,
    quoteUuid: input.quoteUuid,
    originatorLegalEntityType: input.originatorLegalEntityType ?? 'PRIVATE',
    details: input.details ?? {},
    customerTransactionId: input.customerTransactionId,
  }
  return httpJson<any[]>(
    `${process.env.WISE_API_BASE}/v1/transfer-requirements`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) },
  )
}
```

---

## 🧾 Recibo / Banking Partner Info (opcional)

```ts
// GET /v1/transfers/{{id}}/receipt.pdf
export async function downloadReceiptPdf(transferId: number | string): Promise<ArrayBuffer> {
  const res = await fetch(`${process.env.WISE_API_BASE}/v1/transfers/${transferId}/receipt.pdf`, {
    headers: { Authorization: `Bearer ${process.env.WISE_API_TOKEN}` },
  })
  if (!res.ok) throw new Error('Failed to download receipt.pdf')
  return res.arrayBuffer()
}

// GET /v2/transfers/{{id}}/invoices/bankingpartner
export async function getBankingPartnerInfo(transferId: number | string) {
  return httpJson<any>(
    `${process.env.WISE_API_BASE}/v2/transfers/${transferId}/invoices/bankingpartner`,
    { headers: authHeaders() },
  )
}
```

---

## 🧲 Edge Function — `settlement-webhook` (esqueleto)

```ts
// supabase/functions/settlement-webhook/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

export default async (req: Request) => {
  try {
    const raw = await req.text()
    // TODO: validar HMAC se Wise fornecer assinatura (X-Wise-Signature)
    const evt = JSON.parse(raw)

    const transferId = evt?.data?.transferId ?? evt?.transferId
    const status = evt?.data?.currentState ?? evt?.status

    if (!transferId || !status) return new Response('bad payload', { status: 400 })

    await supabase.from('payments').update({
      settlement_status: status,
      settled_at: status === 'outgoing_payment_sent' ? new Date().toISOString() : null,
    }).eq('wise_transfer_id', String(transferId))

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 })
  }
}
```

---

## 🧪 Plano de Teste (sandbox)

1) **Quote BRL→BRL (ou BRL→USD)**  
   - `preferredPayIn="BALANCE"`  
   - `paymentMetadata.transferNature="MOVING_MONEY_BETWEEN_OWN_ACCOUNTS"`  
2) **Recipient**  
   - Pix (BRL) **ou** USD (ACH/SWIFT).  
3) **Transfer**  
   - `customerTransactionId = reference da invoice` (idempotência).  
4) **Fund**  
   - `POST /v3/profiles/{{profileId}}/transfers/{{id}}/payments` → `{ type: "BALANCE" }`.  
5) **Webhook**  
   - Atualiza `payments.settlement_status` e `settled_at`.  
6) **Recibo**  
   - (opcional) baixar `receipt.pdf` quando status for `outgoing_payment_sent`.

---

## 🛡️ Boas práticas

- **Minor units & BigInt (lado do app)** — nunca floats.  
- **Idempotência forte** — `customerTransactionId`/`originalTransferId`.  
- **Requirements dinâmicos** — `POST /v1/transfer-requirements` antes do transfer.  
- **Logs e auditoria** — guardar `quoteId`, `transferId`, `fx_rate`, `fees`, `status`.  
- **Timeouts e retry** — backoff exponencial (máx. 3 tentativas).  

---

## ⚠️ Erros comuns & soluções

- `transfer.insufficient_funds` → adicionar saldo no Wise Balance e **refazer `fund`**.  
- `Quote cannot be accepted ... missing approval` → desabilitar regras de aprovação ou usar **client credentials/mTLS**.  
- `400 account-requirements` → chamar **/v1/transfer-requirements** e incluir campos faltantes.  

---

## 🧩 Exemplo de orquestração (end-to-end)

```ts
// core/offramp/wise/settle.ts
import { createQuote, patchQuoteRecipient } from './quote'
import { ensureRecipientPix } from './recipient'
import { ensureRecipientUSD } from './recipient-usd'
import { createTransfer, fundTransfer } from './transfer'

export async function settleWithWiseBRL(params: {
  profileId: number
  amountMinor: bigint
  recipient: { fullName: string; cpf: string; pixKey: string }
  reference?: string
}) {
  const quote = await createQuote({
    profileId: params.profileId,
    sourceCurrency: 'BRL',
    targetCurrency: 'BRL',
    sourceAmountMinor: params.amountMinor,
    preferredPayIn: 'BALANCE',
    transferNature: 'MOVING_MONEY_BETWEEN_OWN_ACCOUNTS',
  })

  const rec = await ensureRecipientPix({
    profileId: params.profileId,
    fullName: params.recipient.fullName,
    cpf: params.recipient.cpf,
    pixKey: params.recipient.pixKey,
    ownedByCustomer: true,
  })

  await patchQuoteRecipient({
    profileId: params.profileId,
    quoteId: quote.id,
    targetAccountId: rec.id,
    transferNature: 'MOVING_MONEY_BETWEEN_OWN_ACCOUNTS',
  })

  const tx = await createTransfer({
    quoteUuid: quote.id,
    targetAccount: rec.id,
    reference: params.reference ?? 'PIX Settlement',
    transferNature: 'MOVING_MONEY_BETWEEN_OWN_ACCOUNTS',
  })

  const funding = await fundTransfer(params.profileId, tx.id)
  return { quote, recipient: rec, transfer: tx, funding }
}
```

---

**Pronto!** Estes snippets cobrem **quote → recipient → transfer → funding → webhook → receipt** no padrão do nosso projeto. 