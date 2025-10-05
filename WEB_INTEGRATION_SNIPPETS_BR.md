# WEB3 INTEGRATION — Solana Wallets & Solana Pay (Snippets)

> Cole este arquivo no repo para acelerar a integração web3 do **Merchant AI Checkout**. Foco em: Wallet Adapter (React), `reference` como **PublicKey**, **Solana Pay** (QR), chamada às **Edge Functions** (`validate-payment`), leitura de **decimais** do mint, uso de **precise-money**, e (opcional) chamada a **programa**.

---

## 📦 Instalação (pacotes mínimos)

```bash
npm i @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/wallet-adapter-react-ui \
  @solana/pay @solana/spl-token bignumber.js precise-money qrcode.react
```

> Se já estiverem no projeto, ignore. O `qrcode.react` é só para o exemplo do QR.

---

## 🌐 Env & Cluster Toggle

**Client (`.env.local`)**

```env
VITE_SOLANA_CLUSTER=devnet   # devnet | mainnet-beta
VITE_BRZ_MINT=FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD
VITE_MERCHANT_RECIPIENT=<SPL address do lojista>
```

**Edge (secrets)** estão no README (não repetir aqui).

---

## 🧩 AppProviders — Connection + Wallet Adapter

```tsx
// src/web3/AppProviders.tsx
import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import '@solana/wallet-adapter-react-ui/styles.css'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => (
    import.meta.env.VITE_SOLANA_CLUSTER === 'devnet'
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com'
  ), [])

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new BackpackWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
```

### Botão de conexão padrão

```tsx
// src/web3/ConnectButton.tsx
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
export function ConnectButton(){ return <WalletMultiButton className="btn"/> }
```

---

## 🔑 `reference` como PublicKey

```ts
// src/web3/reference.ts
import { Keypair } from '@solana/web3.js'
export function newReferenceBase58(){
  return Keypair.generate().publicKey.toBase58()
}
```

> **Nunca** use UUID simples para `reference`. O `validate-payment` exige `PublicKey` base58 válido.

---

## 🔗 Solana Pay — encode URL + QR

```tsx
// src/web3/qr.tsx
import { encodeURL } from '@solana/pay'
import { PublicKey } from '@solana/web3.js'
import BigNumber from 'bignumber.js'
import { QRCodeSVG } from 'qrcode.react'

export function makeSolanaPayUrl({ amountBRL, recipient, reference, brzMint }:{
  amountBRL: string; recipient: string; reference: string; brzMint?: string
}){
  const params: any = {
    recipient: new PublicKey(recipient),
    amount: new BigNumber(amountBRL),
    reference: new PublicKey(reference),
  }
  if (brzMint) params.splToken = new PublicKey(brzMint)
  return encodeURL(params).toString()
}

export function SolanaPayQR(props:{ url: string; size?: number }){
  const { url, size=256 } = props
  return <QRCodeSVG value={url} size={size} includeMargin />
}
```

### Expiração/regeneração de QR

```ts
// helper simples
export function isExpired(createdAt: number, ttlMs = 5*60_000){
  return (Date.now() - createdAt) > ttlMs
}
```

---

## 🧮 Money Safety — `precise-money`

```ts
// src/web3/money.ts
import { normalizeAmountInput, toMinor, fromMinor, scaleUnits } from 'precise-money'
import { getMint } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'

export async function toBrzMinor({ connection, humanBRL, brzMint }:{
  connection: Connection, humanBRL: string, brzMint: string
}){
  const normalized = normalizeAmountInput(humanBRL) // '125.00'
  const cents = toMinor(normalized, 2)              // 12500n
  const mint = await getMint(connection, new PublicKey(brzMint))
  const dec = mint.decimals
  const brzMinor = scaleUnits(cents, 2, dec)        // BigInt seguro
  return { cents, brzMinor, decimals: dec, displayBRL: fromMinor(cents, 2) }
}
```

---

## 🛰️ Polling — Edge Function `validate-payment`

Use o **Supabase JS** do front para invocar a function (o JWT segue junto; RLS aplicada):

```ts
// src/web3/poll.ts
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export async function pollValidation(reference: string, maxMs=25_000){
  const start = Date.now(); let wait = 900
  while (Date.now() - start < maxMs){
    const { data, error } = await supabase.functions.invoke('validate-payment', { body: { reference } })
    if (error) throw error
    if (data?.status === 'confirmed') return data.tx
    await new Promise(r => setTimeout(r, wait));
    wait = Math.min(Math.round(wait * 1.25), 4000)
  }
  return null // expirou
}
```

---

## 🏧 Fluxo completo (criar cobrança → QR → polling)

```ts
// src/web3/charge.ts
import { makeSolanaPayUrl } from './qr'
import { newReferenceBase58 } from './reference'
import { pollValidation } from './poll'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export async function createChargeAndWatch(amountBRL: string, productIds: string[] = []){
  const reference = newReferenceBase58()
  // cria invoice + payment via RPC do banco (mantém RLS)
  // @ts-ignore: RPC definida no schema `app`
  const { data: inv, error } = await supabase.rpc('app.create_invoice_with_payment', {
    amount: amountBRL, ref: reference, product_ids: productIds
  })
  if (error) throw error

  const url = makeSolanaPayUrl({
    amountBRL,
    recipient: import.meta.env.VITE_MERCHANT_RECIPIENT,
    reference,
    brzMint: import.meta.env.VITE_BRZ_MINT
  })

  const tx = await pollValidation(reference)
  return { reference, url, tx }
}
```

---

## 🧪 Ler `decimals` do mint (defensivo)

```ts
import { getMint } from '@solana/spl-token'
import { PublicKey, Connection } from '@solana/web3.js'

export async function getMintDecimals(connection: Connection, mint: string){
  const info = await getMint(connection, new PublicKey(mint))
  return info.decimals
}
```

> Se `decimals` divergir do esperado, **bloqueie** a cobrança e logue um erro.

---

## 🧠 (Opcional) Chamar um programa `merchant_checkout`

```ts
// src/web3/program.ts
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

export function useProgram(){
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  async function callCheckout(programId: string, accounts: { merchant: string; payer: string }, data: Uint8Array){
    if (!publicKey) throw new Error('wallet not connected')
    const ix = new TransactionInstruction({
      programId: new PublicKey(programId),
      keys: [
        { pubkey: new PublicKey(accounts.merchant), isWritable: true, isSigner: false },
        { pubkey: new PublicKey(accounts.payer), isWritable: true, isSigner: true },
      ],
      data: Buffer.from(data)
    })
    const tx = new Transaction().add(ix)
    const sig = await sendTransaction(tx, connection)
    return sig
  }

  return { callCheckout }
}
```

> Se a wallet/UX não suportar, caia no **transfer SPL** + `validateTransfer` (fallback).

---

## 🖨️ Print “thermal-like” (CSS)

```css
/* src/styles/receipt-print.css */
@media print {
  @page { size: 58mm auto; margin: 0; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .receipt { width: 58mm; padding: 8mm 6mm; font-family: ui-monospace, monospace; color: #000; }
  .receipt h1 { font-size: 14px; margin: 0 0 6px; text-align: center; }
  .line { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; }
  .qr { display: flex; justify-content: center; margin: 10px 0; }
}
```

---

## ⚠️ Armadilhas comuns

* `reference` **não** é UUID — precisa ser **PublicKey**.
* Não assuma `decimals=6` para SPL — **leia do mint**.
* Nunca use `Number`/`parseFloat` para valores — **`precise-money`** sempre.
* Realtime em **views** do Postgres não dispara; assine **tabelas base**.
* Lembre do **TTL** do QR (expirar/regenerar).

---

## 🔚 TL;DR de integração

1. **Wallet Adapter** pronto + connect button.
2. **`reference`** (PublicKey) por cobrança.
3. **encodeURL** (Solana Pay) → renderizar **QR**.
4. **poll** `validate-payment` pela **Edge Function** → `confirmed`.
5. (Opcional) **programa** `merchant_checkout` + fallback SPL.
6. **precise-money** para todas as conversões; decimais lidos do mint.
