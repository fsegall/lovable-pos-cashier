# 🆔 Como Adicionar CPF ao Perfil Wise Sandbox

## 📍 Passo a Passo

### 1. **Login no Sandbox**
```
URL: https://sandbox.transferwise.tech/
Email: segall.felipe@gmail.com
```

### 2. **Ir para Settings → Your details**
```
Menu lateral esquerdo ou canto superior direito
→ Settings / Configurações
→ Your details / Seus dados
```

### 3. **Adicionar ID Number (CPF)**

Procurar por:
- **"Identity Document"** ou **"ID Number"**
- **"Tax ID"** ou **"CPF"**
- Campo para adicionar documento brasileiro

**CPF válido para teste:**
```
111.444.777-35
ou
11144477735
```

### 4. **Verificar Perfil Atualizado**

Depois de salvar, verificar via API:
```bash
curl -s "https://api.sandbox.transferwise.tech/v1/profiles/28977775" \
  -H "Authorization: Bearer e0c86156-e6da-411a-b3e0-59efd75b971f" \
  | jq '.details | {firstName, lastName, dateOfBirth, primaryAddress}'
```

Deve aparecer algum campo com CPF/tax ID.

---

## 🧪 Depois de Adicionar CPF:

### 1. **Reiniciar Edge Functions** (caso tenha parado):
```bash
cd /home/fsegall/Desktop/New_Projects/lovable-pos-cashier
pkill -f "deno.*edge-runtime"
nohup supabase functions serve --env-file supabase/functions/.env > /tmp/edge-functions.log 2>&1 &
```

### 2. **Testar Settlement:**
- Abrir http://localhost:8081
- Receipts → REFDEMO01
- "Settle to Bank" → Wise → BRL
- Confirm Settlement

### 3. **Verificar Logs:**
```bash
tail -50 /tmp/edge-functions.log | grep -A 20 "wise-payout"
```

**Resultado esperado:**
```
✅ Quote created
✅ Transfer created  ← Deve funcionar agora!
❌ Funding failed: Insufficient funds (OK no sandbox)
```

---

## 🔍 Troubleshooting

### Se ainda der erro de CPF:
```
Error: "CPF is mandatory for payments from Brazil"
```

**Possíveis causas:**
1. CPF não foi salvo corretamente
2. Sandbox não permitiu atualizar o perfil
3. Campo errado foi preenchido

**Solução:**
- Tentar novamente pela UI
- Verificar via API se o CPF aparece no perfil
- Contactar suporte Wise (se necessário)

### Se der erro 422 "targetAccount null":
```
Verificar WISE_RECIPIENT_ID no .env:
WISE_RECIPIENT_ID=701639460
```

---

## 📋 Checklist

- [ ] Login no sandbox
- [ ] Ir para Settings → Your details
- [ ] Adicionar CPF: 111.444.777-35
- [ ] Salvar alterações
- [ ] Verificar perfil via API
- [ ] Testar settlement no app
- [ ] Ver resultado nos logs

---

**BOA SORTE!** 🍀

Se conseguir adicionar o CPF, o teste deve funcionar perfeitamente! 🎯

