# MONEY — Amounts, Precision & Safety

> Padrões para valores monetários no **Merchant AI Checkout**. Objetivo: **zero float**, conversões explícitas entre **unidades humanas** (BRL) e **unidades on‑chain** (SPL/SOL), e resultados previsíveis em UI/CSV/integrações.

---

## 🔑 Princípios

1. **Nunca usar `number`/float para dinheiro.** Use **BigInt** ou strings.
2. **Fonte da verdade**: valores em **minor units** (ex.: BRL → centavos; USDC → 6 decimais; SOL → lamports (9)).
3. **Decimais são dinâmicos**: ler do mint on‑chain (não assumir 6).
4. **Conversões explícitas**: sempre docar de→para, com utilitários dedicados.
5. **Arredondamento previsível**: evite arredondar silenciosamente; use regras fixas.
6. **Idempotência**: toda ordem/recibo tem `reference` único.

---

## 🧩 Por que `precise-money`

* Converte com **BigInt** entre escalas (2 ↔︎ N casas) sem perda.
* APIs claras: `toMinor`, `fromMinor`, `scaleUnits`, `applySlippage`, `normalizeAmountInput`.
* Elimina *drift* de ponto flutuante e facilita **validações**.

Instalação:

```bash
npm i precise-money
```

---

## 🔗 Pipelines de Conversão

### 1) Input humano (UI) → BRL (centavos)

```ts
import { normalizeAmountInput, toMinor } from 'precise-money'

const raw = '125,00'          // ou '125.00'
const normalized = normalizeAmountInput(raw) // → '125.00'
const cents = toMinor(normalized, 2)         // → 12500n (BigInt)
```

### 2) BRL (centavos) → SPL (BRZ, decimais dinâmicos)

```ts
import { scaleUnits } from 'precise-money'
import { getMint } from '@solana/spl-token'

const mintInfo = await getMint(connection, BRZ_MINT_PK)
const dec = mintInfo.decimals     // ex.: 6, 7, 9… (não assuma)
const brzMinor = scaleUnits(cents, 2, dec) // BigInt já na escala do SPL
```

### 3) SOL (quando recebido em SOL)

* 1 SOL = **1_000_000_000** lamports (**9** decimais)
* Converta BRL→lamports via preço/rota (caso swap), e **nunca em float**.

### 4) Exibir valores na UI/CSV

```ts
import { fromMinor } from 'precise-money'

const displayBRL = fromMinor(cents, 2)    // "125.00"
const displayBRZ = fromMinor(brzMinor, dec)
```

---

## 🛡️ Validações & Guard‑rails

* **Mín/Máx por cobrança**: rejeitar < R$1,00 ou > limiar configurável.
* **Decimais do mint**: se `dec` divergir do esperado, **bloquear** e logar.
* **Precisão de swap**: defina tolerância com `applySlippage(bps)` e use **minOut** na rota.
* **Sanitização** de input: permitir apenas dígitos, vírgula/ponto.

```ts
import { applySlippage } from 'precise-money'
const minOut = applySlippage(brzMinor, 50) // 50 bps
```

---

## 🧾 Armazenamento & Schema

* **DB**: use **BIGINT** para `amount_minor` (sempre minor units).
* Colunas úteis: `currency_code` (ex.: 'BRL', 'BRZ'), `decimals` (snapshot do mint), `mint_address`.
* **API/Edge**: transmita strings/inteiros; evite floats.

---

## 🔁 Integração com Jupiter (swap opcional)

* Calcule **minOut** com `applySlippage` (bps).
* Faça parsing/serialização de quantias em **string/BigInt**; nunca `parseFloat`.
* Verifique `decimals` de **ambos** os mints antes de montar a rota.

---

## ✅ Boas práticas

* `reference` = **PublicKey** única (base58) por cobrança.
* `validateTransfer` deve checar **recipient**, **amount** (na escala certa) e **mint**.
* Logs/auditoria sempre em **minor units**.
* Toda formatação humana via `fromMinor` (UI/CSV/apresentação).

---

## 🚫 Anti‑padrões

* ❌ `Number(“0.1”) + Number(“0.2”)` para dinheiro.
* ❌ Armazenar valores em string “livre” sem escala.
* ❌ Assumir que todo SPL tem 6 decimais.
* ❌ Arredondar silenciosamente sem critério.

---

## 🧪 Testes sugeridos

* **Property tests**: (a) `fromMinor(toMinor(x,2),2) == x` para amostras de strings válidas.
* **Edge cases**: `0`, `0,01`, grandes valores, separadores `,`/`.` mistos.
* **Decimais variáveis**: simular mints com 6/7/8/9 para `scaleUnits`.

---

## 🔍 Exemplo completo (conceitual)

```ts
import { normalizeAmountInput, toMinor, scaleUnits, fromMinor, applySlippage } from 'precise-money'
import { getMint } from '@solana/spl-token'

export async function prepareAmounts({ connection, humanBRL, brzMintPk }:{
  connection: any, humanBRL: string, brzMintPk: string
}) {
  const normalized = normalizeAmountInput(humanBRL)
  const cents = toMinor(normalized, 2)          // BRL minor (BigInt)

  const mintInfo = await getMint(connection, brzMintPk)
  const dec = mintInfo.decimals
  const brzMinor = scaleUnits(cents, 2, dec)    // BRZ minor (BigInt)

  const minOut = applySlippage(brzMinor, 50)    // 50 bps
  return { cents, brzMinor, minOut, displayBRL: fromMinor(cents, 2), displayBRZ: fromMinor(brzMinor, dec) }
}
```

---

## 📎 Referências rápidas

* `precise-money`: conversões seguras com BigInt
* SPL Token: `getMint` para ler `decimals`
* Solana Pay: `encodeURL`, `findTransactionSignature`, `validateTransfer`

> Siga este guia para qualquer código que toque valores. Se surgir dúvida, prefira **BigInt** + utilitários do `precise-money` e documente a conversão usada.
