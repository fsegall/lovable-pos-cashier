# 📚 Nova Estrutura de Documentação

## 📊 ANÁLISE: 45 arquivos .md total

**Raiz:** 23 arquivos (precisam ser organizados)  
**docs/br/:** 12 arquivos  
**docs/us/:** 3 arquivos  
**Outros:** 7 arquivos (supabase/, etc)

---

## 🗂️ ESTRUTURA TEMÁTICA PROPOSTA

```
docs/
├── br/                                    # 🇧🇷 Português
│   ├── 01-getting-started/               # Primeiros passos
│   │   ├── README.md
│   │   ├── devnet-setup.md
│   │   └── quick-start.md
│   │
│   ├── 02-features/                      # Features & Capabilities
│   │   ├── escopo.md (ESCOPO_BR.md)
│   │   ├── arquitetura-settlement.md
│   │   ├── precise-money.md
│   │   └── ai-features.md (novo)
│   │
│   ├── 03-apis/                          # Integrações APIs
│   │   ├── wise/
│   │   │   ├── setup.md
│   │   │   ├── specs.md
│   │   │   └── adapter.md
│   │   ├── circle/
│   │   │   └── setup.md
│   │   └── web-integration.md
│   │
│   ├── 04-testing/                       # Testing & Debug
│   │   ├── debug-guide.md
│   │   ├── test-session.md
│   │   └── demo-mode.md (traduzir)
│   │
│   ├── 05-ui-ux/                         # UI/UX
│   │   ├── ui-analysis.md
│   │   └── screenshot-checklist.md
│   │
│   ├── 06-business/                      # Business & Strategy
│   │   ├── positioning-roadmap.md
│   │   ├── transfero-meeting.md
│   │   ├── social-media-strategy.md (traduzir)
│   │   └── twitter-templates.md (traduzir)
│   │
│   └── 07-progress/                      # Daily Progress
│       ├── checklist.md (master)
│       ├── todo-dia-10.md
│       ├── daily-2025-10-07.md
│       ├── daily-2025-10-08.md
│       └── day-2-summary.md
│
├── us/                                    # 🇺🇸 English
│   ├── 01-getting-started/
│   │   ├── README.md
│   │   ├── devnet-setup.md (DEVNET_SETUP.md)
│   │   └── quick-start.md
│   │
│   ├── 02-features/
│   │   ├── scope.md (já existe)
│   │   ├── settlement-architecture.md (traduzir)
│   │   ├── precise-money.md (traduzir)
│   │   ├── ai-features.md (AI_POSITIONING.md)
│   │   └── jupiter-integration.md (JUPITER_COMPLETE.md)
│   │
│   ├── 03-apis/
│   │   ├── wise/
│   │   │   ├── setup-guide.md (WISE_SETUP_GUIDE.md)
│   │   │   ├── api-specs.md (WISE_API_SPECS.md)
│   │   │   ├── token-debug.md (WISE_TOKEN_DEBUG.md)
│   │   │   ├── add-cpf.md (WISE_ADD_CPF.md)
│   │   │   ├── solution.md (WISE_SOLUTION.md)
│   │   │   └── test-results.md (WISE_TEST_RESULTS.md)
│   │   ├── circle/
│   │   │   ├── key-help.md (CIRCLE_KEY_HELP.md)
│   │   │   └── setup.md (novo)
│   │   └── jupiter/
│   │       ├── implementation.md (JUPITER_IMPLEMENTATION_STATUS.md)
│   │       ├── test-guide.md (JUPITER_READY_TO_TEST.md)
│   │       └── complete.md (JUPITER_COMPLETE.md)
│   │
│   ├── 04-testing/
│   │   ├── settlement-test-guide.md (SETTLEMENT_TEST_GUIDE.md)
│   │   ├── demo-mode.md (DEMO_MODE_GUIDE.md)
│   │   └── hackathon-demo.md (HACKATHON_DEMO_GUIDE.md)
│   │
│   ├── 05-business/
│   │   ├── ai-positioning.md (AI_POSITIONING.md)
│   │   ├── social-media-strategy.md (SOCIAL_MEDIA_STRATEGY.md)
│   │   ├── twitter-templates.md (TWITTER_POSTS_TEMPLATES.md)
│   │   └── pitch-deck.md (PITCH_DECK_OUTLINE.md)
│   │
│   └── 06-progress/
│       ├── day-09-summary.md (DAY_09_SUMMARY.md)
│       └── todo-day-10.md (TODO_DIA_10.md traduzido)
│
└── scripts/                               # Helper Scripts
    ├── check-settlements.sh
    ├── test-wise-token.sh
    └── create-wise-recipient.sh
```

---

## 🔄 MIGRAÇÕES & RENOMEAÇÕES

### **Português (adicionar _BR se faltando):**
```
✅ BUSINESS_POSITIONING_AND_ROADMAP_BR.md
✅ DEBUG_GUIDE_BR.md
✅ TRANSFERO_MEETING.md → TRANSFERO_MEETING_BR.md
✅ TODO_DIA_10.md → TODO_DIA_10_BR.md
```

### **Inglês (remover _EN se tiver):**
```
✅ DEVNET_SETUP.md (já está correto)
✅ WISE_SETUP_GUIDE.md (já está correto)
✅ Todos os WISE_*.md (já estão corretos)
```

---

## 🌍 TRADUÇÕES PRIORITÁRIAS (v2.0)

### **Alta prioridade:**
```
1. ESCOPO_BR.md → docs/us/02-features/scope.md (merge c/ existente)
2. SETTLEMENT_ARCHITECTURE_BR.md → .../settlement-architecture.md
3. CHECKLIST_BR.md → docs/us/06-progress/checklist.md
```

### **Média prioridade:**
```
4. BUSINESS_POSITIONING_AND_ROADMAP_BR.md → .../business-positioning.md
5. DEBUG_GUIDE_BR.md → .../debug-guide.md
```

### **Baixa prioridade:**
```
6. Daily checklists (específicos de data)
7. Test sessions
```

---

## ✅ AÇÕES IMEDIATAS

### **1. Criar pastas temáticas:**
```bash
mkdir -p docs/br/{01-getting-started,02-features,03-apis/wise,03-apis/circle,03-apis/jupiter,04-testing,05-ui-ux,06-business,07-progress}
mkdir -p docs/us/{01-getting-started,02-features,03-apis/wise,03-apis/circle,03-apis/jupiter,04-testing,05-business,06-progress}
mkdir -p scripts
```

### **2. Mover arquivos raiz:**
```bash
# Wise docs → docs/us/03-apis/wise/
mv WISE_*.md docs/us/03-apis/wise/

# Circle docs → docs/us/03-apis/circle/
mv CIRCLE_*.md docs/us/03-apis/circle/

# Jupiter docs → docs/us/03-apis/jupiter/
mv JUPITER_*.md docs/us/03-apis/jupiter/

# Business docs → docs/us/05-business/
mv *POSITIONING*.md *SOCIAL*.md *TWITTER*.md *PITCH*.md docs/us/05-business/

# Daily docs
mv DAY_*.md TODO_*.md docs/us/06-progress/ ou docs/br/07-progress/

# Scripts
mv *.sh scripts/
```

### **3. Renomear para clareza:**
```bash
# Remove redundância no nome
# Ex: WISE_SETUP_GUIDE.md → setup-guide.md (dentro de wise/)
```

### **4. Atualizar links:**
```bash
# Buscar links quebrados
# Atualizar referências
```

---

## 🎯 VANTAGENS

```
✅ Fácil navegação (por tema)
✅ Clara separação BR/US
✅ Escalável (adicionar novos docs)
✅ Profissional
✅ Hackathon judges impressionados!
```

---

**EXECUTAR AGORA?** 🚀

