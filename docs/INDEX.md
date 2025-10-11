# 📚 Solana Merchant AI - Documentation Index

> **Comprehensive, bilingual documentation for the AI-powered crypto POS**

**Total:** 38 essential documents | **Languages:** 🇺🇸 English + 🇧🇷 Português

---

## 🌍 Choose Your Language

- 🇺🇸 [English Documentation](./us/) - 20 files
- 🇧🇷 [Documentação em Português](./br/) - 16 files

**Key docs available in BOTH languages!** ✅

---

## 🇺🇸 English Documentation

### 📖 [01-getting-started/](./us/01-getting-started/)
- [Documentation Structure](./us/01-getting-started/docs-structure.md)
- [Reorganization Plan](./us/01-getting-started/docs-reorganization-plan.md)

### 🚀 [02-features/](./us/02-features/)
- [Project Scope](./us/02-features/scope.md) - Complete feature overview

### 🔌 [03-apis/](./us/03-apis/)

#### Wise API (Multi-currency Settlement)
- [Setup Guide](./us/03-apis/wise/setup-guide.md)
- [API Specs](./us/03-apis/wise/api-specs.md) (2886 lines!)
- [Token Debug Guide](./us/03-apis/wise/token-debug.md)
- [Adding CPF](./us/03-apis/wise/add-cpf.md)
- [Solution Doc](./us/03-apis/wise/solution.md)
- [Test Results](./us/03-apis/wise/test-results.md)

#### Circle API (USD/EUR Settlement)
- [API Key Help](./us/03-apis/circle/key-help.md)

#### Jupiter API (Multi-token Support)
- [Implementation Status](./us/03-apis/jupiter/implementation-status.md)
- [Test Guide](./us/03-apis/jupiter/test-guide.md)
- [Complete Doc](./us/03-apis/jupiter/complete.md) ⭐

### 🧪 [04-testing/](./us/04-testing/)
- [Settlement Test Guide](./us/04-testing/settlement-test-guide.md)
- [DEMO Mode Guide](./us/04-testing/demo-mode-guide.md)
- [Hackathon Demo Guide](./us/04-testing/hackathon-demo-guide.md)

### 💼 [05-business/](./us/05-business/)
- [AI Positioning Strategy](./us/05-business/ai-positioning.md) ⭐
- [Social Media Strategy](./us/05-business/social-media-strategy.md)
- [Twitter Post Templates](./us/05-business/twitter-templates.md)
- [Pitch Deck Outline](./us/05-business/pitch-deck-outline.md)
- [Hackathon Info](./us/05-business/hackathon-info.md)

### 📊 [06-progress/](./us/06-progress/)
- [Day 09 Summary](./us/06-progress/day-09-summary.md)

---

## 🇧🇷 Documentação em Português

### 📖 [01-getting-started/](./br/01-getting-started/)
- [Devnet Setup](./br/01-getting-started/devnet-setup.md)

### 🚀 [02-features/](./br/02-features/)
- [Escopo do Projeto](./br/02-features/escopo.md) - Visão geral completa
- [Arquitetura de Settlement](./br/02-features/settlement-architecture.md)
- [Precise Money](./br/02-features/precise-money.md) - Manipulação segura de valores

### 🔌 [03-apis/](./br/03-apis/)
- [Web Integration Snippets](./br/03-apis/web-integration-snippets.md)
- [Wise Adapter Specs](./br/03-apis/wise/adapter-specs.md)

### 🧪 [04-testing/](./br/04-testing/)
- [Debug Guide](./br/04-testing/debug-guide.md)
- [Test Session 2025-10-08](./br/04-testing/test-session-2025-10-08.md)

### 🎨 [05-ui-ux/](./br/05-ui-ux/)
- [UI/UX Analysis](./br/05-ui-ux/ui-analysis.md)
- [Screenshot Checklist](./br/05-ui-ux/screenshot-checklist.md) ⭐

### 💼 [06-business/](./br/06-business/)
- [Positioning & Roadmap](./br/06-business/positioning-roadmap.md)
- [Transfero Meeting Notes](./br/06-business/transfero-meeting.md)

### 📊 [07-progress/](./br/07-progress/)
- [Checklist Master](./br/07-progress/checklist.md) ⭐
- [Daily 2025-10-07](./br/07-progress/daily-2025-10-07.md)
- [Daily 2025-10-08](./br/07-progress/daily-2025-10-08.md)
- [Day 2 Summary](./br/07-progress/day-2-summary.md)
- [TODO Dia 10](./br/07-progress/todo-dia-10.md)

---

## 🛠️ Scripts & Tools

Located in [`/scripts`](../scripts/):
- [`check-settlements.sh`](../scripts/check-settlements.sh) - Check settlement records in DB
- [`test-wise-token.sh`](../scripts/test-wise-token.sh) - Validate Wise API token
- [`create-wise-recipient.sh`](../scripts/create-wise-recipient.sh) - Create BRL recipient

---

## 🔍 Quick Reference

### For Developers:
- ⭐ [Features Overview](./us/02-features/scope.md)
- ⚙️ [Wise API Setup](./us/03-apis/wise/setup-guide.md)
- 🪐 [Jupiter Integration](./us/03-apis/jupiter/complete.md)
- 🧪 [Testing Guides](./us/04-testing/)

### For Business:
- 🤖 [AI Positioning](./us/05-business/ai-positioning.md)
- 📱 [Social Media Strategy](./us/05-business/social-media-strategy.md)
- 🎤 [Pitch Deck](./us/05-business/pitch-deck-outline.md)

### Para Desenvolvedores (PT):
- ⭐ [Escopo Completo](./br/02-features/escopo.md)
- 📋 [Checklist Master](./br/07-progress/checklist.md)
- 🎨 [Screenshots](./br/05-ui-ux/screenshot-checklist.md)

---

## 📦 Supabase Documentation

Database and Edge Functions docs are in [`/supabase`](../supabase/):
- [Database Schema](../supabase/DATABASE_SCHEMA.md)
- [Edge Functions README](../supabase/functions/README.md)

---

## 🎯 Getting Started

1. Read the [Project Scope](./us/02-features/scope.md) (EN) or [Escopo](./br/02-features/escopo.md) (PT)
2. Follow [Devnet Setup](./br/01-getting-started/devnet-setup.md)
3. Check [Hackathon Demo Guide](./us/04-testing/hackathon-demo-guide.md)
4. Start building! 🚀

---

## 🤝 Contributing

Found an issue? Want to improve docs?
1. Create an issue
2. Submit a PR
3. Follow the folder structure

---

**Built for @Colosseum_org Hackathon 2025** 🏆  
**Repository:** github.com/fsegall/solana-merchant-ai 🤖

