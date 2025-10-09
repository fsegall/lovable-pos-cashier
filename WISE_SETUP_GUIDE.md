# 🔧 Wise Sandbox - Setup Guide

## 📝 Obter Credenciais

### 1. Criar conta Wise Sandbox
```
URL: https://sandbox.transferwise.tech/
```

### 2. Gerar API Token
1. Login no sandbox
2. Settings → API tokens
3. Create new token
4. Copiar token (começa com `Bearer ...`)

### 3. Obter Profile ID
```bash
# Testar autenticação e pegar profile ID
curl https://api.sandbox.transferwise.tech/v1/profiles \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response: [{ "id": 12345, "type": "personal", ... }]
# Copiar o "id"
```

---

## ⚙️ Configurar no Projeto

### Opção 1: Edge Functions (.env local)

Criar/editar: `supabase/functions/.env`

```bash
# Wise Configuration
WISE_API_TOKEN=your-wise-api-token-here
WISE_API_BASE=https://api.sandbox.transferwise.tech
WISE_PROFILE_ID=12345
WISE_WEBHOOK_SECRET=optional-webhook-secret
```

### Opção 2: Supabase Secrets (production)

```bash
supabase secrets set WISE_API_TOKEN=your-token
supabase secrets set WISE_API_BASE=https://api.sandbox.transferwise.tech
supabase secrets set WISE_PROFILE_ID=12345
supabase secrets set WISE_WEBHOOK_SECRET=your-secret
```

---

## 🧪 Testar Configuração

### 1. Testar autenticação:

```bash
curl https://api.sandbox.transferwise.tech/v1/profiles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Esperado:** Lista de profiles (status 200)

### 2. Testar no app:

```bash
# Reiniciar Edge Functions
supabase functions serve --env-file supabase/functions/.env

# No navegador:
# 1. Ir para receipt confirmado
# 2. Clicar "Settle to Bank"
# 3. Selecionar "Wise" + "BRL"
# 4. Clicar "Confirm Settlement"
```

**Esperado:** 
- Chamada para `/functions/v1/wise-payout`
- Logs mostram: quote created, transfer created, funded
- Status muda para "settled"

---

## 📊 Fluxo Completo (Wise)

```
1. Quote     → POST /v3/profiles/{id}/quotes
2. Transfer  → POST /v1/transfers
3. Fund      → POST /v3/profiles/{id}/transfers/{id}/payments
4. Webhook   → (aguardar) POST /wise-webhook
5. Settled   → Status atualizado no banco
```

---

## 🐛 Troubleshooting

### Erro: "Insufficient funds"
```
Problema: Wise balance vazio no sandbox
Solução: Adicionar balance fictício no sandbox dashboard
```

### Erro: "Invalid token"
```
Problema: Token expirado ou inválido
Solução: Gerar novo token no sandbox
```

### Erro: "Profile not found"
```
Problema: WISE_PROFILE_ID incorreto
Solução: Verificar ID com GET /v1/profiles
```

---

## ✅ Checklist de Configuração

- [ ] Conta criada no sandbox.transferwise.tech
- [ ] API token gerado
- [ ] Profile ID obtido
- [ ] Variáveis configuradas em `.env`
- [ ] Edge Functions reiniciadas
- [ ] Teste de autenticação OK
- [ ] Teste de payout OK

---

**Pronto para configurar!** 🚀

