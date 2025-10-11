# 🧹 Documentation Cleanup Plan

## 🎯 Objetivo
Remover docs temporários/debug, manter apenas essenciais e com comprovação.

---

## 📊 ANÁLISE: 46 arquivos .md

**BR:** 19 files  
**US:** 27 files  
**Total:** 46 files

---

## 🗑️ TEMPORÁRIOS (Sugestão de REMOVER)

### **Debug & Troubleshooting Temporários:**
```
❌ docs/us/03-apis/wise/token-debug.md
   → Debug específico de token, resolvido

❌ docs/us/03-apis/wise/add-cpf.md
   → Tentativa que não funcionou (sandbox limitation)

❌ docs/us/03-apis/circle/key-help.md
   → Troubleshooting temporário, issue resolvido

❌ docs/br/04-testing/debug-guide.md
   → Debug geral, não essencial para final
```

### **Status/Progress Temporários:**
```
❌ docs/us/03-apis/jupiter/implementation-status.md
   → Status durante implementação, agora completo

❌ docs/us/03-apis/jupiter/test-guide.md
   → Duplicado com TESTING_GUIDE.md (manter um)

❌ docs/br/04-testing/test-session-2025-10-08.md
   → Sessão de teste específica, temporária

❌ docs/br/07-progress/daily-2025-10-07.md
   → Daily temporário

❌ docs/br/07-progress/daily-2025-10-08.md
   → Daily temporário

❌ docs/br/07-progress/todo-dia-10.md
   → TODO temporário
```

### **Meta-Docs (não essenciais):**
```
❌ docs/us/01-getting-started/docs-reorganization-plan.md
   → Meta-doc da reorganização, já executado

❌ docs/us/01-getting-started/docs-structure.md
   → Meta-doc da estrutura, já implementado
```

### **Testing Guides Redundantes:**
```
❌ docs/us/04-testing/settlement-test-guide.md
   → Testes de sandbox, já documentados em test-results

❌ docs/us/04-testing/demo-mode-guide.md
   → Workaround temporário, pode ficar em code comments
```

**TOTAL A REMOVER: 14 arquivos** 🗑️

---

## ✅ ESSENCIAIS (MANTER)

### **📖 Core Documentation:**
```
✅ docs/br/02-features/escopo.md → Scope completo PT
✅ docs/us/02-features/scope.md → Scope completo EN
✅ docs/br/02-features/settlement-architecture.md → Arquitetura
✅ docs/br/02-features/precise-money.md → Conceito importante
✅ docs/br/07-progress/checklist.md → Master progress ⭐
```

### **🔌 API References (Essenciais):**
```
✅ docs/us/03-apis/wise/api-specs.md → 2886 linhas! Referência completa
✅ docs/us/03-apis/wise/setup-guide.md → Setup essencial
✅ docs/us/03-apis/wise/solution.md → Soluções documentadas
✅ docs/us/03-apis/wise/test-results.md → Resultados oficiais ⭐
✅ docs/br/03-apis/wise/adapter-specs.md → Specs BR
✅ docs/br/03-apis/web-integration-snippets.md → Code examples
```

### **🪐 Jupiter (Final Docs):**
```
✅ docs/us/03-apis/jupiter/complete.md → Implementação final ⭐
✅ docs/us/03-apis/jupiter/TESTING_GUIDE.md → Guia de teste
✅ docs/us/03-apis/README.md → Hub de navegação

Remover:
❌ implementation-status.md (temporário)
❌ test-guide.md (duplicado com TESTING_GUIDE.md)
```

### **🎨 UI/UX:**
```
✅ docs/br/05-ui-ux/screenshot-checklist.md → Guia de screenshots ⭐
✅ docs/br/05-ui-ux/ui-analysis.md → Análise de interface
```

### **💼 Business & Strategy:**
```
✅ docs/us/05-business/ai-positioning.md → Estratégia AI ⭐
✅ docs/us/05-business/pitch-deck-outline.md → Apresentação ⭐
✅ docs/us/05-business/social-media-strategy.md → Marketing
✅ docs/us/05-business/twitter-templates.md → Posts prontos
✅ docs/us/05-business/hackathon-info.md → Info hackathon
✅ docs/br/06-business/positioning-roadmap.md → Roadmap BR
✅ docs/br/06-business/transfero-meeting.md → Meeting notes
```

### **📊 Progress (Summaries Finais):**
```
✅ docs/us/06-progress/day-09-summary.md → Summary Day 9 ⭐
✅ docs/us/06-progress/DAY_10_SUMMARY.md → Summary Day 10 ⭐
✅ docs/br/07-progress/day-2-summary.md → Summary Day 2

Remover:
❌ daily-2025-10-XX.md (dailies são temporários)
❌ todo-dia-10.md (TODO temporário)
```

### **🧪 Testing (Guias Finais):**
```
✅ docs/us/04-testing/hackathon-demo-guide.md → Demo oficial ⭐
✅ docs/us/04-testing/HMAC_VALIDATION_GUIDE.md → Security ⭐

Remover:
❌ demo-mode-guide.md (workaround)
❌ settlement-test-guide.md (sandbox tests)
```

### **📚 Navigation:**
```
✅ docs/INDEX.md → Central hub ⭐
✅ docs/br/README.md → PT navigation
✅ docs/us/README.md → EN navigation
✅ docs/us/03-apis/README.md → APIs hub
```

**TOTAL A MANTER: 32 arquivos** ✅

---

## 📁 ESTRUTURA FINAL PROPOSTA

```
docs/
├── INDEX.md ⭐
│
├── br/ (14 files)
│   ├── 01-getting-started/
│   │   └── devnet-setup.md
│   ├── 02-features/
│   │   ├── escopo.md ⭐
│   │   ├── precise-money.md
│   │   └── settlement-architecture.md
│   ├── 03-apis/
│   │   ├── web-integration-snippets.md
│   │   └── wise/adapter-specs.md
│   ├── 05-ui-ux/
│   │   ├── screenshot-checklist.md ⭐
│   │   └── ui-analysis.md
│   ├── 06-business/
│   │   ├── positioning-roadmap.md
│   │   └── transfero-meeting.md
│   ├── 07-progress/
│   │   ├── checklist.md ⭐
│   │   └── day-2-summary.md
│   └── README.md
│
└── us/ (18 files)
    ├── 02-features/
    │   ├── scope.md ⭐
    │   ├── precise-money.md (traduzir)
    │   └── settlement-architecture.md (traduzir)
    ├── 03-apis/
    │   ├── README.md
    │   ├── wise/
    │   │   ├── api-specs.md (2886 lines - reference!)
    │   │   ├── setup-guide.md
    │   │   ├── solution.md
    │   │   └── test-results.md ⭐
    │   └── jupiter/
    │       ├── complete.md ⭐
    │       └── TESTING_GUIDE.md
    ├── 04-testing/
    │   ├── hackathon-demo-guide.md ⭐
    │   └── HMAC_VALIDATION_GUIDE.md ⭐
    ├── 05-business/
    │   ├── ai-positioning.md ⭐
    │   ├── pitch-deck-outline.md ⭐
    │   ├── social-media-strategy.md
    │   ├── twitter-templates.md
    │   └── hackathon-info.md
    ├── 06-progress/
    │   ├── day-09-summary.md ⭐
    │   └── DAY_10_SUMMARY.md ⭐
    └── README.md

scripts/ (3 files - manter)
```

**TOTAL FINAL: ~32 arquivos essenciais** 📚

---

## 🎯 RESULTADO

```
Antes: 46 arquivos (confuso)
Depois: 32 arquivos (essencial)
Redução: 30%
Qualidade: ALTA! ✨
```

---

## 💬 DECISÃO

**Você quer:**

**A)** 🗑️ **Executar cleanup agora** (remover 14 temporários)  
**B)** 📝 **Revisar lista primeiro**, escolher o que remover  
**C)** ➕ **Adicionar traduções** antes de remover  

**Recomendação: A!** 
Limpar agora = estrutura final clara! Traduções podem vir depois se necessário.

**O que decide?** 😊

