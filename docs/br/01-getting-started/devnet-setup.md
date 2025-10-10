# 💫 Merchant AI Checkout — Solana Devnet Setup

## 🎯 Objetivo
Configurar o ambiente Devnet com token tBRZ (BRL fake) e conta merchant isolada para testes de pagamentos on-chain com Solana Pay e precise-money.

---

## ✅ Etapas realizadas

1. **Carteira Merchant (Tesouraria)**
   - Criada via `solana-keygen new -o ~/.config/solana/merchant.json`
   - Pubkey: `5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE`
   - Recebeu 1 SOL (para taxas de transação)

2. **Mint tBRZ**
   - Criado com `spl-token create-token --decimals 6 --fee-payer ~/.config/solana/merchant.json`
   - Mint address: `6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4`
   - Simula BRL token na Devnet (6 casas decimais)

3. **ATA (Token Account) do Merchant**
   - Criada com `spl-token create-account <MINT> --owner ~/.config/solana/merchant.json`
   - ATA: `EpCxeMKvvSJ9RuAYgTbjBF4jTRfW9oXbE4TrEDdvy9U6`
   - Recebeu 1000 tBRZ via mint

---

## 🔐 Endereços importantes

| Tipo | Endereço | Descrição |
|------|-----------|-----------|
| **Merchant Recipient (Owner)** | `5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE` | Tesouraria principal. É o “recipient” no Solana Pay. |
| **tBRZ Mint** | `6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4` | Mint do token BRL de teste. |
| **Merchant ATA (tBRZ)** | `EpCxeMKvvSJ9RuAYgTbjBF4jTRfW9oXbE4TrEDdvy9U6` | Conta SPL derivada `(owner, mint)` que armazena os tBRZ. |

---

## ⚙️ Arquivo `.env`

### Client (`.env` na raiz)
```bash
# Solana Configuration
VITE_SOLANA_CLUSTER=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_MERCHANT_RECIPIENT=5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE
VITE_BRZ_MINT_DEVNET=6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4

# Supabase (obrigatório)
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Dev Mode
DEMO_MODE=true
```

### Edge Functions (`supabase/functions/.env`)
```bash
# Supabase Local
SUPABASE_LOCAL_URL=http://127.0.0.1:54321
SUPABASE_LOCAL_SERVICE_ROLE_KEY=<your-service-role-key>

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
BRZ_MINT=6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4
MERCHANT_RECIPIENT=5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE
DEMO_MODE=true
```

---

## 🧮 Como a validação funciona

1. `recipient` = Merchant (owner)  
2. `splToken` = tBRZ mint  
3. `reference` = UUID base58 único por cobrança  
4. Edge Function `validate-payment` busca transação e confirma:
   - transferência para ATA `(mint, owner)`
   - valor exato conforme decimals
   - mint correto
   - status “confirmed/finalized”

---

## 🧩 Relação de entidades

```mermaid
graph TD
  A[Cliente] -->|Solana Pay QR| B[Merchant Recipient (Owner)]
  B -->|Possui| C[tBRZ Mint]
  B -->|Deriva| D[Merchant ATA (Owner+Mint)]
  D -->|Armazena| E[tBRZ Tokens]
```

---

## 🧠 Observações

- O **Merchant Recipient** é o dono (wallet base).  
- O **ATA** é derivado automaticamente (não precisa ser incluído no QR).  
- `validate-payment` pode validar apenas `owner+mint` ou checar o `ATA` explicitamente.  
- Tudo é armazenado e validado em **minor units (BigInt)**, conforme `MONEY.md`.

---

## ✅ Testado com sucesso
✔️ Airdrop  
✔️ Mint criação e supply  
✔️ Criação de ATA  
✔️ Mint de 1000 tBRZ  
✔️ Atualização de `.env`  
✔️ Leitura on-chain com `getMint`  
✔️ Saldo em conta: 1000 tBRZ  
✔️ Solana Wallet Adapter integrado  
✔️ Solana Pay QR funcionando  
✔️ Polling de validação on-chain  
✔️ Sem erros 🎉

---

## 🧪 Como testar o fluxo completo

### 1. Preparar ambiente
```bash
# Copiar .env.example para .env
cp .env.example .env

# Editar .env com os valores acima
# Garantir que Supabase esteja configurado
```

### 2. Iniciar serviços
```bash
# Terminal 1: Supabase local
supabase start

# Terminal 2: Edge Functions
npx supabase functions serve --env-file supabase/functions/.env --no-verify-jwt

# Terminal 3: Frontend
npm run dev
```

### 3. Testar pagamento
1. Abra `http://localhost:5173` (ou porta do Vite)
2. Faça login (ou crie conta)
3. No POS, crie uma cobrança (ex: R$ 10.00)
4. **Com Solana configurado:**
   - Verá QR Solana Pay automático
   - Conecte Phantom Wallet (no devnet!)
   - Escaneie ou copie o link
   - Aprove transação com tBRZ
   - Aguarde confirmação (~3-10s)
5. **Sem Solana configurado:**
   - Verá QR mock (modo fallback)
   - Use botão "Dev: Confirmar" para simular

### 4. Verificar confirmação
- Status muda automaticamente: `pending → confirmed`
- TX hash aparece no recibo
- Dados salvos no Supabase
- Realtime atualiza a UI

---

## 🐛 Troubleshooting

### Wallet não conecta
- ✅ Phantom instalado e no **devnet**
- ✅ Wallet tem SOL para gas fees
- ✅ `VITE_SOLANA_CLUSTER=devnet` no `.env`

### QR não gera
- ✅ `VITE_MERCHANT_RECIPIENT` configurado
- ✅ Endereço é válido (58 caracteres base58)
- ✅ Console do navegador sem erros

### Pagamento não confirma
- ✅ Edge Function `validate-payment` rodando
- ✅ `SOLANA_RPC_URL` acessível
- ✅ Transação existe on-chain (verificar no Solana Explorer devnet)
- ✅ Valor e mint corretos

### ATA não encontrada
- ✅ Cliente criou ATA para tBRZ antes de enviar
- ✅ Usar wallet que já tem tokens do mint configurado
