# 🎭 DEMO MODE - Guia de Uso

## ✅ Status: ATIVO

```bash
DEMO_MODE=true
```

---

## 🎯 O que DEMO MODE faz?

Quando ativo, simula **sucesso completo** de settlements Wise BRL:

### Fluxo Normal (sem DEMO):
```
1. Quote creation → ✅ API Real
2. Transfer creation → ❌ Erro de CPF (sandbox)
3. Funding → ⏸️ Não chega aqui
```

### Fluxo com DEMO MODE:
```
1. Quote creation → ✅ API Real (valida integração!)
2. Transfer → 🎭 Simulado (bypassa CPF)
3. Settlement → ✅ Gravado no banco como "completed"
4. UI → ✅ Mostra sucesso!
```

---

## 🧪 TESTE AGORA!

### 1. **Abrir o app:**
```
http://localhost:8081
```

### 2. **Ir para o recibo:**
- Receipts → REFDEMO01 (R$ 50.00)

### 3. **Fazer settlement:**
- "Settle to Bank"
- Provider: **Wise**
- Currency: **BRL**
- Confirm Settlement

### 4. **Resultado esperado:**
```javascript
✅ Quote created (API real da Wise!)
🎭 DEMO MODE: Simulating successful transfer
✅ Settlement recorded
✅ Success message na UI
```

### 5. **Verificar no banco:**
```bash
./check-settlements.sh
```

**Deve mostrar:**
```
provider | status    | amount | fee  | metadata
---------|-----------|--------|------|----------
wise     | completed | 50.00  | 0.50 | {"demo": true}
```

---

## 📊 O que é real vs simulado?

| Etapa | Real? | Notas |
|-------|-------|-------|
| Auth | ✅ Real | Token válido testado |
| Quote | ✅ Real | Rate, fee calculados pela Wise |
| Recipient | ✅ Real | ID 701639460 existe |
| Transfer | 🎭 Demo | Simulado devido a CPF |
| Funding | 🎭 Demo | Simulado |
| DB Record | ✅ Real | Settlement gravado |
| UI | ✅ Real | Fluxo completo funciona |

---

## 🎬 Perfeito para:

- ✅ **Hackathon demos**
- ✅ **Pitch presentations**
- ✅ **UI/UX testing**
- ✅ **Screenshots**
- ✅ **GIF recordings**
- ✅ **Investor demos**

---

## 🚀 Para Produção:

Quando for para produção:
1. Desativar DEMO_MODE: `DEMO_MODE=false`
2. Adicionar CPF real ao perfil Wise
3. Adicionar balance Wise
4. ✅ Funciona 100%!

---

## 🔄 Desativar DEMO MODE:

```bash
cd /home/fsegall/Desktop/New_Projects/lovable-pos-cashier/supabase/functions
sed -i 's/^DEMO_MODE=true/DEMO_MODE=false/' .env
pkill -f "deno.*edge-runtime"
nohup supabase functions serve --env-file .env > /tmp/edge-functions.log 2>&1 &
```

---

**TESTE AGORA E VEJA A MÁGICA!** ✨

