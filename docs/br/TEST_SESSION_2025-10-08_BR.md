# 🧪 Sessão de Testes - 8 OUT 2025
## Teste: Pagamento On-Chain Real com Solana Pay

---

## 🎯 Objetivo
Validar o fluxo completo de pagamento on-chain no **devnet** com Phantom Wallet.

---

## ✅ Pré-requisitos (VERIFICADOS)

- ✅ Supabase local: `http://127.0.0.1:54321`
- ✅ Frontend (Vite): `http://localhost:8080`
- ✅ Database: migrations aplicadas (settlements + webhook_events)
- ✅ Cluster: **devnet**
- ✅ Merchant: `5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE`
- ✅ tBRZ Mint: `6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4`
- ✅ DEMO_MODE: `false` (validação REAL)

---

## 📱 Setup da Wallet (Phantom)

### 1. Verificar Phantom está no Devnet
- [ ] Abrir Phantom extension
- [ ] Settings (⚙️) → Developer Settings
- [ ] Network: **Devnet** (não mainnet!)
- [ ] Verificar endereço da wallet

### 2. Obter SOL para gas fees
```bash
# Se precisar de SOL
solana airdrop 1 <SUA_WALLET_ADDRESS> --url devnet
```

### 3. Obter tBRZ tokens
- [ ] Enviar seu endereço para o merchant
- [ ] Aguardar receber alguns tBRZ
- [ ] Verificar saldo no Phantom (pode não aparecer visualmente, mas estará lá)

---

## 🧪 TESTE 1: Gerar QR Solana Pay

### Passos:
1. [ ] Abrir navegador em `http://localhost:8080`
2. [ ] Fazer login (criar conta se necessário)
3. [ ] Ir para a página **POS**
4. [ ] Conectar Phantom Wallet (botão no header)
   - [ ] Verificar: "Connected" aparece
   - [ ] Verificar: endereço visível

5. [ ] Criar uma cobrança:
   - [ ] Digitar valor: **R$ 10.00** (ou qualquer valor)
   - [ ] Clicar "Gerar QR" ou Enter
   
6. [ ] Verificar QR Code:
   - [ ] QR apareceu em < 2s? ⏱️ **______s**
   - [ ] Timer aparece (10 minutos countdown)?
   - [ ] Botão "Copiar Link" presente?
   - [ ] Botão "Regenerar QR" presente?

### ✅ Resultado Esperado:
```
✓ QR Code gerado
✓ Timer ativo (10:00)
✓ Status: "Aguardando pagamento..."
✓ Invoice criada no banco (status: pending)
```

### ❌ Se falhou:
- [ ] Verificar console do navegador (F12)
- [ ] Verificar se wallet está conectada
- [ ] Verificar se VITE_MERCHANT_RECIPIENT está configurado
- [ ] Anotar erro: _______________

---

## 🧪 TESTE 2: Fazer Pagamento (Desktop)

### Passos:
1. [ ] Clicar no botão "Copiar Link"
2. [ ] Abrir o link copiado em nova aba (ou clicar no QR)
3. [ ] Phantom deve abrir automaticamente
4. [ ] Na tela do Phantom:
   - [ ] Verificar destinatário: `5Nxve...jKXE`
   - [ ] Verificar valor: `10 tBRZ` (ou o valor que digitou)
   - [ ] Verificar gas fee: ~0.000005 SOL
   - [ ] Verificar "Network: Devnet"

5. [ ] Clicar **"Approve"**
6. [ ] Aguardar confirmação no Phantom

### ✅ Resultado Esperado:
```
✓ Transação enviada
✓ Phantom mostra "Success"
✓ Transaction ID aparece
```

### ⏱️ Tempo:
- Tempo da transação: **______s**

### ❌ Se falhou:
- [ ] "Insufficient funds" → precisa SOL ou tBRZ
- [ ] "Transaction failed" → verificar RPC do devnet
- [ ] Timeout → rede devnet pode estar lenta
- [ ] Anotar erro: _______________

---

## 🧪 TESTE 3: Validação On-Chain Automática

### Passos:
1. [ ] Voltar para a aba do POS
2. [ ] Observar a UI (NÃO precisa fazer nada)
3. [ ] Aguardar até **10 segundos**

### ✅ Resultado Esperado:
```
✓ Status muda automaticamente: "pending" → "confirmed"
✓ Aparece: ícone de sucesso ✅
✓ Aparece: "Pagamento Confirmado!"
✓ Aparece: Transaction hash (link para Solana Explorer)
✓ Botão "Ver Recibo" habilitado
```

### ⏱️ Tempo:
- Tempo até confirmação na UI: **______s**
- Tempo total (approve → confirmação): **______s**

### ❌ Se não confirmou:
- [ ] Aguardar mais 10s (pode ser polling interval)
- [ ] Verificar Edge Function `validate-payment`:
  ```bash
  # Verificar logs da Edge Function
  supabase functions logs validate-payment
  ```
- [ ] Verificar banco de dados:
  ```bash
  # Verificar status do payment
  psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
    -c "SELECT ref, status, tx_hash, confirmed_at FROM payments ORDER BY created_at DESC LIMIT 5;"
  ```
- [ ] Anotar problema: _______________

---

## 🧪 TESTE 4: Visualizar Recibo

### Passos:
1. [ ] Clicar em "Ver Recibo" ou ir para aba "Receipts"
2. [ ] Encontrar o recibo recém-criado (topo da lista)
3. [ ] Clicar no recibo para abrir detalhes

### ✅ Resultado Esperado:
```
✓ Status: "confirmed" (badge verde)
✓ Valor: R$ 10.00
✓ Data/hora: timestamp correto
✓ Transaction ID: hash clicável (abre Solana Explorer devnet)
✓ Merchant: 5Nxve...jKXE
✓ Reference: PublicKey (58 caracteres)
```

### Screenshot:
- [ ] Tirar screenshot do recibo ✅

---

## 🧪 TESTE 5: Verificar On-Chain (Explorer)

### Passos:
1. [ ] Copiar o Transaction Hash do recibo
2. [ ] Abrir: `https://explorer.solana.com/?cluster=devnet`
3. [ ] Colar o TX hash na busca
4. [ ] Verificar transação

### ✅ Resultado Esperado:
```
✓ Transação encontrada
✓ Status: "Success" (verde)
✓ Timestamp: ~agora
✓ From: Sua wallet
✓ To: 5Nxve...jKXE (merchant)
✓ Amount: 10 tokens
✓ Token: tBRZ (6Pzmkf...)
✓ Slot: número alto (devnet atual)
```

---

## 🧪 TESTE 6: Regenerar QR (Expiração)

### Passos:
1. [ ] Criar nova cobrança (R$ 5.00)
2. [ ] Aguardar aparecer QR
3. [ ] **NÃO pagar ainda**
4. [ ] Aguardar 10 minutos (ou mudar o timer no código para 1 min)
5. [ ] Verificar se QR expira

### ✅ Resultado Esperado:
```
✓ Timer chega em 00:00
✓ QR fica "expirado" (cinza ou desabilitado)
✓ Botão "Regenerar QR" fica destacado
✓ Clicar "Regenerar" → novo QR com novo reference
```

### ⏱️ Timer funcional?
- [ ] Sim
- [ ] Não (anotar problema: _______________)

---

## 🧪 TESTE 7: Realtime Updates (Opcional)

### Objetivo: 
Testar se multiple tabs sincronizam em tempo real.

### Passos:
1. [ ] Abrir `http://localhost:8080` em 2 abas diferentes
2. [ ] Fazer login nas duas
3. [ ] Em **Aba 1**: Criar cobrança e gerar QR
4. [ ] Em **Aba 2**: Ir para "Receipts" (não atualizar página)
5. [ ] Em **Aba 1**: Fazer pagamento
6. [ ] Observar **Aba 2**

### ✅ Resultado Esperado:
```
✓ Aba 2 atualiza automaticamente (sem F5)
✓ Novo recibo aparece na lista
✓ Status muda de "pending" → "confirmed" em tempo real
```

---

## 📊 Resumo dos Resultados

### ✅ Testes Aprovados:
- [ ] TESTE 1: Gerar QR
- [ ] TESTE 2: Fazer Pagamento
- [ ] TESTE 3: Validação Automática
- [ ] TESTE 4: Visualizar Recibo
- [ ] TESTE 5: Verificar On-Chain
- [ ] TESTE 6: Regenerar QR
- [ ] TESTE 7: Realtime Updates

### ⏱️ Métricas:
- **QR Generation Time:** ______s (meta: < 2s)
- **Transaction Time:** ______s
- **Validation Time:** ______s (meta: < 10s)
- **Total Time (end-to-end):** ______s

### ❌ Problemas Encontrados:
1. _______________
2. _______________
3. _______________

### 💡 Melhorias Identificadas:
1. _______________
2. _______________
3. _______________

---

## 🎯 Próximos Passos

Após todos os testes passarem:
1. [ ] Commit dos resultados: `test: validate real on-chain payments with Phantom wallet`
2. [ ] Atualizar DAILY_CHECKLIST_2025-10-08.md
3. [ ] Screenshot/vídeo do fluxo funcionando
4. [ ] Seguir para settlement providers (Circle/Wise)

---

## 📝 Notas Adicionais

(Anote aqui qualquer observação relevante durante os testes)

---

**Data:** 08/10/2025  
**Tester:** _____________  
**Duração da sessão:** ______ min

