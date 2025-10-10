# 🔑 Como Obter Circle API Key Válida

## ❌ Problema Atual
```
Key: TEST_API_KEY:2f2258287801dd3f9135b94bc2f689fd:939a7a3a605ea7d076207b843387d9d4
Error: "Invalid credentials" (401)
```

---

## ✅ Como Obter Key Correta

### 1. **Criar Conta Circle Sandbox**
```
URL: https://app-sandbox.circle.com/signup
```

### 2. **Login e Ir para API Keys**
```
1. Login em: https://app-sandbox.circle.com/
2. Menu lateral: Settings → API Keys
3. Ou direto: https://app-sandbox.circle.com/settings/apikeys
```

### 3. **Criar Nova API Key**
```
1. Click "Create API Key" ou "New Key"
2. Nome: "Solana POS Development"
3. Environment: Sandbox
4. Permissions: Full access (ou pelo menos Wallets + Payouts)
5. Click "Create"
```

### 4. **Copiar Key Completa**

**Formato esperado:**
```
TEST_API_KEY:xxxx-xxxx-xxxx:yyyy-yyyy-yyyy
```

**Exemplo válido:**
```
TEST_API_KEY:ebb3ad72232624921abc4b162148bb84:019ef3358ef9cd6d08fc32csfe89a68d
```

**⚠️ ATENÇÃO:**
- Key tem **3 partes** separadas por `:`
- Primeira parte: `TEST_API_KEY`
- Segunda parte: Key ID (32 caracteres hex)
- Terceira parte: Secret (32 caracteres hex)

---

## 🧪 Testar Key

```bash
curl -X GET "https://api-sandbox.circle.com/v1/configuration" \
  -H "Authorization: Bearer SUA_KEY_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta esperada (sucesso):**
```json
{
  "data": {
    "payments": { ... }
  }
}
```

**Resposta de erro:**
```json
{
  "code": 401,
  "message": "Invalid credentials."
}
```

---

## 🔧 Adicionar ao Projeto

### Opção 1: Via .env
```bash
cd /home/fsegall/Desktop/New_Projects/lovable-pos-cashier/supabase/functions
nano .env

# Adicionar/substituir:
CIRCLE_API_KEY=TEST_API_KEY:sua-key-aqui
```

### Opção 2: Via comando
```bash
cd supabase/functions
echo "CIRCLE_API_KEY=TEST_API_KEY:sua-key-aqui" >> .env
```

### Depois reiniciar:
```bash
pkill -f "deno.*edge-runtime"
nohup supabase functions serve --env-file .env > /tmp/edge-functions.log 2>&1 &
```

---

## 📊 Key vs Token - Qual é qual?

### ❌ Você tem Token Wise (já funciona):
```
e0c86156-e6da-411a-b3e0-59efd75b971f
→ Formato UUID simples
→ Wise funciona assim
```

### ❓ Você precisa Key Circle (formato diferente):
```
TEST_API_KEY:2f2258287801dd3f9135b94bc2f689fd:939a7a3a605ea7d076207b843387d9d4
→ Formato: ENV:ID:SECRET
→ Circle funciona assim
```

**Possível problema:** A key que você tem pode ser:
1. ❌ De ambiente errado (PROD em vez de SANDBOX)
2. ❌ Expirada
3. ❌ Revogada
4. ❌ Mal formatada

---

## 🎯 Próximos Passos

### Se você TEM conta Circle:
1. Login em https://app-sandbox.circle.com/
2. Settings → API Keys
3. Criar nova key
4. Copiar key completa
5. Adicionar ao .env
6. Testar

### Se você NÃO TEM conta Circle:
**Opção A:** Criar conta agora (5 min)  
**Opção B:** Deixar Circle para depois  
**Opção C:** Usar só Wise com DEMO MODE ✅

---

## ✅ Alternativa: Wise DEMO está funcionando!

Se Circle der muito trabalho, você já tem:
- ✅ Wise com DEMO MODE funcionando
- ✅ Quote real da API
- ✅ Settlement simulado
- ✅ UI completa
- ✅ Pronto para demo!

**Suficiente para hackathon!** 🎉

---

**Você tem conta Circle ou precisa criar?** 🤔

