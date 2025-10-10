# 🔧 Guia de Debug - Solana Pay

## 🐛 Problemas Comuns e Soluções

### ❌ Erro: "Something went wrong" no Phantom Mobile

**Causas possíveis:**

#### 1. **Network Mismatch** (Mais comum!)
```
Problema: App configurado para Devnet, mas Phantom no Mainnet (ou vice-versa)
```

**Solução:**
- Abrir Phantom → Settings (⚙️)
- Developer Settings → Change Network
- Selecionar **Devnet**
- Tentar novamente

---

#### 2. **Sem saldo de SOL (Gas Fees)**
```
Problema: Precisa de ~0.000005 SOL para enviar transação
```

**Solução (Desktop):**
```bash
# Enviar SOL para sua wallet
solana airdrop 1 <SEU_ENDERECO> --url devnet

# OU usar o faucet:
# https://faucet.solana.com/
```

---

#### 3. **Sem tokens tBRZ**
```
Problema: Tentando enviar tBRZ mas não tem nenhum
```

**Solução:**
Enviar tBRZ de teste:
```bash
spl-token transfer \
  --fund-recipient \
  --allow-unfunded-recipient \
  6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4 \
  100 \
  <SEU_ENDERECO> \
  --owner ~/.config/solana/merchant.json \
  --url devnet
```

---

#### 4. **Link Solana Pay malformado**
```
Problema: Faltando parâmetros ou formato incorreto
```

**Verificar se tem:**
- ✅ `recipient=` (58 caracteres)
- ✅ `amount=` (número > 0)
- ✅ `spl-token=` (58 caracteres)
- ✅ `reference=` (58 caracteres)

**Link correto:**
```
solana:5Nxve...?amount=10&spl-token=6Pzmkf...&reference=8kFB1o...&label=...
```

---

#### 5. **Decimais do token errados**
```
Problema: Amount não corresponde aos decimais do token
```

**Verificar:**
```bash
# Ver decimals do tBRZ
spl-token display 6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4 --url devnet

# Deve mostrar: decimals: 6
```

**No código:**
- R$ 18.00 com 6 decimals = 18000000 (18 * 10^6)
- Mas Solana Pay espera o valor em unidades base (18, não 18000000)
- ⚠️ VERIFICAR: Solana Pay está usando valor correto?

---

## 🧪 Debug no Console do Navegador

### 1. Abrir DevTools (F12)

### 2. Copiar e colar este código:

```javascript
// Parsear link Solana Pay
const link = "solana:5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE?amount=18&spl-token=6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4&reference=8kFB1oXu9SVYjn6RfL26gxDmdgUBCaAJhHD682d69odD&label=Payment+REF04W733&message=Pay+R%24+18.00";

const url = new URL(link);
console.log({
  protocol: url.protocol,
  recipient: url.pathname,
  params: Object.fromEntries(url.searchParams),
});
```

### 3. Verificar output:
```json
{
  "protocol": "solana:",
  "recipient": "5Nxve...",
  "params": {
    "amount": "18",
    "spl-token": "6Pzmkf...",
    "reference": "8kFB1o...",
    "label": "Payment REF04W733",
    "message": "Pay R$ 18.00"
  }
}
```

---

## 🔬 Testes Detalhados

### Teste 1: Verificar sua wallet Phantom

**Desktop (Phantom Extension):**
1. Abrir Phantom
2. Clicar no ícone de configurações (⚙️)
3. Developer Settings
4. Verificar:
   - Network: **Devnet** ✅
   - RPC: Default ou custom?

5. Ir para "Assets"
6. Procurar por:
   - SOL: deve ter > 0.001
   - tBRZ ou token custom: qualquer quantidade

**Mobile:**
1. Abrir Phantom
2. Settings → Developer Mode
3. Verificar Network: Devnet
4. Ver saldo SOL e tokens

---

### Teste 2: Validar mint on-chain

```bash
# Ver informações do mint tBRZ
spl-token display 6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4 --url devnet

# Esperado:
# Address: 6Pzmkf...
# Decimals: 6
# Supply: ...
```

---

### Teste 3: Simular transação manualmente

```bash
# Enviar tBRZ de uma wallet para merchant (simulando pagamento)
spl-token transfer \
  6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4 \
  18 \
  5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE \
  --url devnet

# Se funcionar, o problema é no Phantom mobile
# Se não funcionar, o problema é no mint/network
```

---

## 📊 Logs em Tempo Real

### Monitorar Edge Function:

```bash
# Em um terminal separado:
docker logs -f supabase_edge_runtime_niocfujcwmbwictdpfsn 2>&1 | grep -E "validate|error|Error"
```

### Monitorar Database:

```bash
# Ver últimas invoices criadas:
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -c "SELECT ref, status, reference, amount_brl, created_at FROM invoices ORDER BY created_at DESC LIMIT 5;"
```

---

## 🎯 Checklist de Debug

Execute na ordem:

- [ ] **Network:** Phantom está no Devnet?
- [ ] **SOL:** Tem pelo menos 0.01 SOL?
- [ ] **tBRZ:** Tem algum saldo de tBRZ?
- [ ] **Link:** Tem todos os parâmetros? (recipient, amount, spl-token, reference)
- [ ] **Mint:** É válido? (verificar com `spl-token display`)
- [ ] **RPC:** Devnet RPC está acessível?

---

## 💡 Teste Simplificado

**Teste com SOL puro (sem SPL token):**

1. Criar cobrança pequena: **R$ 1.00**
2. Remover temporariamente o `splToken` do código
3. Tentar enviar SOL nativo
4. Se funcionar → problema é no tBRZ mint
5. Se não funcionar → problema é no Phantom/Network

---

## 🆘 Precisando de Ajuda?

**Me forneça:**
1. ✅ Seu endereço Phantom (para enviar tBRZ)
2. ✅ Screenshot do erro (se possível)
3. ✅ Network que está usando (Devnet/Mainnet)
4. ✅ Output do console do navegador

**Eu posso:**
- Enviar tBRZ de teste
- Verificar se mint está correto
- Ajustar código se necessário
- Criar versão simplificada para testar

---

**Tenta abrir Phantom e ir em Settings → verificar Network agora?** 📱

