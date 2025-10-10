# 📚 Documentação - Plano de Reorganização

## 🎯 Objetivo
Organizar 23+ arquivos .md em estrutura temática clara com pastas BR/US.

---

## 📁 ESTRUTURA PROPOSTA

```
docs/
├── br/                          # Português
│   ├── 01-setup/               # Setup & Config
│   ├── 02-api/                 # APIs & Integrations
│   ├── 03-testing/             # Testing & Debug
│   ├── 04-business/            # Strategy & Planning
│   └── 05-daily/               # Daily progress
│
└── us/                          # English
    ├── 01-setup/
    ├── 02-api/
    ├── 03-testing/
    ├── 04-business/
    └── 05-daily/
```

---

## 🗂️ CATEGORIZAÇÃO (23 arquivos raiz)

### **📁 01-setup/ (Setup & Configuration)**
```
DEVNET_SETUP.md → docs/us/01-setup/devnet-setup.md
WISE_SETUP_GUIDE.md → docs/us/01-setup/wise-setup.md
WISE_TOKEN_DEBUG.md → docs/us/01-setup/wise-token-debug.md
WISE_ADD_CPF.md → docs/us/01-setup/wise-add-cpf.md
CIRCLE_KEY_HELP.md → docs/us/01-setup/circle-key-help.md
SETTLEMENT_TEST_GUIDE.md → docs/us/01-setup/settlement-test-guide.md
```

### **📁 02-api/ (APIs & Specs)**
```
WISE_API_SPECS.md → docs/us/02-api/wise-api-specs.md
WISE_ADAPTER_SPECS.md → docs/us/02-api/wise-adapter-specs.md
WISE_SOLUTION.md → docs/us/02-api/wise-solution.md
WEB_INTEGRATION_SNIPPETS_BR.md → docs/br/02-api/web-integration-snippets.md
```

### **📁 03-testing/ (Testing & Debug)**
```
WISE_TEST_RESULTS.md → docs/us/03-testing/wise-test-results.md
DEBUG_GUIDE_BR.md → docs/br/03-testing/debug-guide.md
DEMO_MODE_GUIDE.md → docs/us/03-testing/demo-mode-guide.md
```

### **📁 04-business/ (Business & Strategy)**
```
BUSINESS_POSITIONING_AND_ROADMAP_BR.md → docs/br/04-business/positioning-roadmap.md
TRANSFERO_MEETING.md → docs/br/04-business/transfero-meeting.md
AI_POSITIONING.md → docs/us/04-business/ai-positioning.md
SOCIAL_MEDIA_STRATEGY.md → docs/us/04-business/social-media-strategy.md
TWITTER_POSTS_TEMPLATES.md → docs/us/04-business/twitter-templates.md
PITCH_DECK_OUTLINE.md → docs/us/04-business/pitch-deck-outline.md
```

### **📁 05-daily/ (Daily Progress)**
```
TODO_DIA_10.md → docs/br/05-daily/todo-dia-10.md
DAY_09_SUMMARY.md → docs/us/05-daily/day-09-summary.md
```

### **📁 06-implementation/ (Implementation Docs)**
```
JUPITER_IMPLEMENTATION_STATUS.md → docs/us/06-implementation/jupiter-status.md
JUPITER_READY_TO_TEST.md → docs/us/06-implementation/jupiter-test-guide.md
JUPITER_COMPLETE.md → docs/us/06-implementation/jupiter-complete.md
```

### **🏠 MANTER NA RAIZ (Main docs)**
```
README.md (principal EN)
README_BR.md (principal PT) - já existe em docs/br?
```

---

## 🔄 ARQUIVOS JÁ ORGANIZADOS

### **docs/br/ (existentes):**
```
CHECKLIST_BR.md
DAILY_CHECKLIST_2025-10-07_BR.md
DAILY_CHECKLIST_2025-10-08_BR.md
DAY_2_SUMMARY_2025-10-08.md
ESCOPO_BR.md
PRECISE_MONEY_BR.md
SCREENSHOT_CHECKLIST_BR.md
SETTLEMENT_ARCHITECTURE_BR.md
```

### **docs/us/ (existentes):**
```
HACKATHON_DEMO_GUIDE.md
SCOPE.md
```

---

## 📝 SCRIPTS DE REORGANIZAÇÃO

### **Helper scripts:**
```
check-settlements.sh → scripts/check-settlements.sh
test-wise-token.sh → scripts/test-wise-token.sh
create-wise-recipient.sh → scripts/create-wise-recipient.sh
```

---

## 🌍 TRADUÇÃO NECESSÁRIA

### **Português → Inglês (prioridade):**
```
1. ESCOPO_BR.md → SCOPE.md (merge com existente)
2. CHECKLIST_BR.md → CHECKLIST.md (traduzir)
3. SETTLEMENT_ARCHITECTURE_BR.md → SETTLEMENT_ARCHITECTURE.md
4. WEB_INTEGRATION_SNIPPETS_BR.md → WEB_INTEGRATION_SNIPPETS.md
```

### **Inglês → Português (se necessário):**
```
- Maioria já tem versão PT
- Focar em docs técnicos que faltam
```

---

## ⚡ EXECUÇÃO (3 fases)

### **Fase 1: Criar estrutura** (5 min)
```bash
mkdir -p docs/{br,us}/{01-setup,02-api,03-testing,04-business,05-daily,06-implementation}
mkdir -p scripts
```

### **Fase 2: Mover arquivos** (10 min)
```bash
# Move + rename arquivos raiz para pastas corretas
# Remove redundâncias
# Atualiza links internos
```

### **Fase 3: Traduzir prioritários** (30 min)
```bash
# ESCOPO_BR → SCOPE (merge)
# CHECKLIST_BR → CHECKLIST
# Principais docs técnicos
```

---

## 🎯 RESULTADO FINAL

```
docs/
├── br/
│   ├── 01-setup/          (4-5 arquivos)
│   ├── 02-api/            (2-3 arquivos)
│   ├── 03-testing/        (2-3 arquivos)
│   ├── 04-business/       (4-5 arquivos)
│   ├── 05-daily/          (3-4 arquivos)
│   └── 06-implementation/ (vazio ou poucos)
│
└── us/
    ├── 01-setup/          (5-6 arquivos)
    ├── 02-api/            (4-5 arquivos)
    ├── 03-testing/        (3-4 arquivos)
    ├── 04-business/       (5-6 arquivos)
    ├── 05-daily/          (2-3 arquivos)
    └── 06-implementation/ (3-4 arquivos)

scripts/
├── check-settlements.sh
├── test-wise-token.sh
└── create-wise-recipient.sh

Raiz:
├── README.md (EN - principal)
└── README_BR.md (PT - link para docs/br)
```

---

## 💬 **VOCÊ QUER:**

**A)** 🚀 **Executar tudo agora** (45 min - 1h total)  
**B)** 📋 **Revisar o plano primeiro**, depois executar  
**C)** ⏸️ **Deixar para depois**, focar em testar UI agora  

**O que prefere?** 😊

Se escolher A, eu executo tudo automaticamente! 🤖
