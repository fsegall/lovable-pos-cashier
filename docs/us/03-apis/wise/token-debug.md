# 🔍 Wise Token Troubleshooting

## ❌ Erro Atual: "Invalid token"

```json
{
  "error": "invalid_token",
  "error_description": "Invalid token"
}
```

---

## ✅ Checklist para Obter Token Correto

### 1. **Verificar Ambiente**
- [ ] Logado em **sandbox.transferwise.tech** (NÃO wise.com)
- [ ] Account type: **Personal** ou **Business**?

### 2. **Criar API Token no Sandbox**

**URL:** https://sandbox.transferwise.tech/settings/api-tokens

**Passos:**
1. Login no sandbox
2. Menu: Settings → API tokens (ou /settings/api-tokens)
3. Click: "Create new token"
4. Preencher:
   - **Name:** `Solana POS Development`
   - **Permissions:**
     - ✅ Read accounts
     - ✅ Create quotes
     - ✅ Create transfers
     - ✅ Fund transfers
   - **Environment:** Sandbox
5. Click "Create token"
6. **COPIAR TOKEN IMEDIATAMENTE** (só mostra uma vez!)

**Formato esperado:**
```
UUID format: a21bf378-09bc-484b-8df3-1570dccf8fb1
OU
JWT format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
```

### 3. **Testar Token Manualmente**

```bash
# Substituir YOUR_TOKEN pelo token copiado
curl https://api.sandbox.transferwise.tech/v1/profiles \
  -H "Authorization: Bearer YOUR_TOKEN"

# Esperado: Lista de profiles (status 200)
# Se 401: Token inválido, gerar novo
```

### 4. **Obter Profile ID**

Se o comando acima funcionar, você verá:
```json
[
  {
    "id": 12345,
    "type": "personal",
    "details": { ... }
  }
]
```

**Copiar o "id"** (ex: `12345`)

### 5. **Configurar .env**

Editar: `supabase/functions/.env`

```bash
# Wise Settlement Provider
WISE_API_TOKEN=seu-token-correto-aqui
WISE_API_BASE=https://api.sandbox.transferwise.tech
WISE_PROFILE_ID=12345
WISE_WEBHOOK_SECRET=optional-webhook-secret
```

**IMPORTANTE:**
- Nome da variável: `WISE_API_TOKEN` (não `WISE_API_KEY`)
- Sem espaços antes/depois do `=`
- Sem aspas no valor

### 6. **Reiniciar Edge Functions**

```bash
# Parar se estiver rodando (Ctrl+C)
supabase functions serve

# Ver logs para confirmar que .env foi carregado
```

---

## 🐛 **Erros Comuns**

### Erro: "Invalid token"
```
Causa: Token incorreto, expirado, ou ambiente errado
Solução: Gerar novo token no sandbox
```

### Erro: "Unauthorized"
```
Causa: Token sem permissões necessárias
Solução: Recriar token com todas as permissões
```

### Erro: "Profile not found"
```
Causa: WISE_PROFILE_ID incorreto
Solução: Obter ID correto via GET /v1/profiles
```

### Erro: "Insufficient permissions"
```
Causa: Token não tem permissão para criar transfers
Solução: Recriar token com "Create transfers" habilitado
```

---

## 📸 **Screenshots Úteis**

Quando criar o token, tire screenshot de:
1. Página de criação do token
2. Token gerado (antes de sair da página)
3. Lista de permissões selecionadas

---

## ✅ **Teste Final**

Depois de configurar:

```bash
# 1. Testar autenticação
curl https://api.sandbox.transferwise.tech/v1/profiles \
  -H "Authorization: Bearer SEU_TOKEN"

# 2. Testar no app
# - Ir para receipt confirmado
# - "Settle to Bank" → Wise → BRL
# - Ver logs da Edge Function

# 3. Ver logs
supabase functions logs wise-payout --follow
```

---

## 🆘 **Ainda não funciona?**

**Alternativas:**

1. **Testar com DEMO_MODE primeiro:**
   ```bash
   # Em .env
   DEMO_MODE=true
   ```

2. **Verificar documentação oficial:**
   - https://api-docs.transferwise.com/
   - https://api-docs.transferwise.com/#authentication

3. **Criar nova conta no sandbox:**
   - Às vezes tokens ficam "presos"
   - Criar nova conta pode resolver

---

**Depois de obter o token correto, volte aqui e teste!** 🚀

