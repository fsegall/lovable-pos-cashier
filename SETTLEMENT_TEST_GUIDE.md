# 🧪 Guia de Teste - Settlement Providers

## ✅ Status da Configuração

```
✅ Wise API Token:     e0c86156-e6da-411a-b3e0-59efd75b971f
✅ Wise Profile ID:    28977775
✅ Wise Base URL:      https://api.sandbox.transferwise.tech
✅ Circle API Key:     2f2258287801dd3f9135b94bc2f689fd:***
✅ Circle Base URL:    https://api-sandbox.circle.com
⚠️  Circle Wallet ID:  (não configurado - opcional)
✅ DEMO_MODE:          false (usando APIs reais!)
```

---

## 🧪 Teste 1: Wise Payout (BRL)

### Pré-requisitos:
- ✅ Payment confirmado de R$ 50.00 (REF: REFDEMO01)
- ✅ Wise API configurada
- ⚠️  Wise balance pode estar vazio no sandbox (esperado)

### Passos:

1. **Abrir app:** http://localhost:5173

2. **Ir para Receipts:**
   - Menu → Receipts
   - Procurar "REFDEMO01" (R$ 50.00)
   - Clicar no recibo

3. **Iniciar Settlement:**
   - Card azul: "Settlement Available"
   - Botão: "Settle to Bank"
   - Modal deve abrir

4. **Configurar Wise:**
   - Provider: **Wise**
   - Currency: **BRL**
   - Ver estimativa:
     ```
     Amount:      R$ 50.00
     Est. Fee:    ~R$ 0.50 (1%)
     You Receive: ~R$ 49.50
     ```

5. **Confirmar:**
   - Clicar "Confirm Settlement"

### Resultados Esperados:

#### ✅ **Cenário 1: Sucesso (improvável no sandbox sem balance)**
```
✅ Creating Wise quote...
✅ Quote created: xxxxx
✅ Creating transfer...
✅ Transfer created: xxxxx
✅ Funding transfer...
✅ Transfer funded!
✅ Settlement recorded
```

#### ⚠️ **Cenário 2: Insufficient funds (esperado no sandbox)**
```
✅ Creating Wise quote...
✅ Quote created: xxxxx
✅ Creating transfer...
❌ Error funding transfer: Insufficient funds
⚠️  Settlement marked as failed
```

**Isso é OK!** Significa que:
- ✅ API Token válido
- ✅ Profile ID correto
- ✅ Quote funcionando
- ✅ Transfer criado
- ⚠️  Apenas falta balance no sandbox

#### ❌ **Cenário 3: Erro de autenticação**
```
❌ Error: Invalid token / Unauthorized
```

**Solução:** Verificar `WISE_API_TOKEN` no `.env`

---

## 🧪 Teste 2: Circle Payout (USD)

### Pré-requisitos:
- ✅ Payment confirmado
- ✅ Circle API configurada
- ⚠️  Circle Wallet ID necessário
- ⚠️  Recipient ID necessário (para onde enviar)

### Passos:

1. **Mesmo fluxo do Wise:**
   - Receipts → REFDEMO01
   - "Settle to Bank"

2. **Configurar Circle:**
   - Provider: **Circle**
   - Currency: **USD** (único disponível)
   - Ver estimativa

3. **Confirmar:**
   - Clicar "Confirm Settlement"

### Resultados Esperados:

#### ⚠️ **Cenário 1: Wallet ID faltando (esperado)**
```
❌ Error: Circle Wallet ID not configured
```

**Isso é OK!** Circle requer:
- Wallet ID (source de onde saem os fundos)
- Recipient ID (destination account)

#### ✅ **Cenário 2: Configurado corretamente**
```
✅ Creating Circle payout...
✅ Payout created: xxxxx
✅ Settlement recorded
```

---

## 📊 Verificar no Banco de Dados

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "
SELECT 
  s.id,
  s.provider,
  s.currency,
  s.amount,
  s.status,
  s.error_message,
  s.created_at
FROM settlements s
ORDER BY s.created_at DESC
LIMIT 5;
"
```

### Status esperados:
- `pending` → Criado, aguardando processamento
- `processing` → Em andamento
- `completed` → ✅ Sucesso!
- `failed` → ❌ Erro (ver `error_message`)

---

## 📋 Checklist de Testes

### Wise:
- [ ] Modal abre corretamente
- [ ] Dropdown Wise aparece
- [ ] Currency selector mostra BRL/USD/EUR/GBP
- [ ] Fee estimado: ~1%
- [ ] API chamada com sucesso
- [ ] Quote criado (ver logs)
- [ ] Transfer criado (ou erro de insufficient funds - OK)
- [ ] Registro na tabela `settlements`

### Circle:
- [ ] Modal abre corretamente
- [ ] Dropdown Circle aparece
- [ ] Currency: USD apenas
- [ ] Fee estimado: ~0.5%
- [ ] Erro esperado: "Wallet ID not configured"
- [ ] Registro na tabela `settlements` (se configurado)

### UI/UX:
- [ ] Modal responsivo
- [ ] Dropdowns funcionais
- [ ] Fee calculation dinâmico
- [ ] Loading states
- [ ] Error messages claras
- [ ] Success toast notification

### Dashboard:
- [ ] Reports → Settlement Analytics
- [ ] Cards atualizam depois de settlement
- [ ] "Crypto Balance" diminui
- [ ] "Settled to Bank" aumenta
- [ ] Métricas corretas

---

## 🐛 Troubleshooting

### Erro: "Validation failed: Unauthorized"
```
Problema: Frontend não está enviando JWT
Solução: Já corrigido - usar supabase.functions.invoke()
```

### Erro: "Invalid token" (Wise)
```
Problema: WISE_API_TOKEN incorreto
Solução: 
1. Verificar token em .env
2. Gerar novo token no sandbox
3. Reiniciar Edge Functions
```

### Erro: "Wallet ID not configured" (Circle)
```
Problema: CIRCLE_WALLET_ID vazio
Solução: 
1. Criar wallet no Circle sandbox
2. Adicionar ID ao .env
3. Reiniciar Edge Functions
```

### Erro: "Insufficient funds" (Wise)
```
Problema: Sandbox balance vazio
Solução: 
1. É esperado no sandbox
2. Testar em produção com balance real
3. OU adicionar balance fictício no sandbox (se disponível)
```

### Settlement fica em "pending" forever
```
Problema: Webhook não está funcionando
Solução:
1. Webhooks só funcionam em produção (URL pública)
2. Em dev: manualmente atualizar status no DB
3. OU: testar transição pending → completed via UI
```

---

## ✅ Critérios de Sucesso

**Teste passa se:**
- ✅ Modal abre e fecha corretamente
- ✅ Dropdowns funcionam (provider + currency)
- ✅ API é chamada (ver Network tab)
- ✅ Registro criado na tabela `settlements`
- ✅ Status: `pending`, `processing`, `completed`, ou `failed` com mensagem clara
- ✅ Logs mostram detalhes do processo

**Teste FALHA se:**
- ❌ Modal não abre
- ❌ API não é chamada
- ❌ Erro sem mensagem clara
- ❌ Nenhum registro no banco
- ❌ Crash da aplicação

---

## 🚀 Próximos Passos Depois dos Testes

1. **Se Wise funcionar:**
   - ✅ Marcar TODO "Testar Wise payout" como completo
   - 📸 Screenshot do modal + logs
   - 📝 Documentar resultado

2. **Se Circle der erro esperado:**
   - ✅ Confirmar que API key está correta
   - ⚠️  Obter Wallet ID (opcional)
   - 📝 Documentar limitação

3. **Atualizar Settings Page:**
   - Badge "Configured" (verde) para Wise
   - Badge "Not Configured" (amarelo) para Circle

4. **Implementar HMAC validation:**
   - Validar assinaturas dos webhooks
   - Prevenir replay attacks

5. **Atualizar docs finais:**
   - README com setup completo
   - Screenshots
   - Diagrama de arquitetura

---

**COMECE AGORA!** 🧪

Abra: http://localhost:5173 → Receipts → REFDEMO01 → "Settle to Bank"

