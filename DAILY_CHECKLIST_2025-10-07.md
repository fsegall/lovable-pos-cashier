# 📅 Daily Checklist - 7 OUT 2025
## 🎯 Objetivo: Integração Solana - Day 1

> **Meta:** Transformar o POS em DApp completo com Solana Pay, Wallet Adapter e validação on-chain.

---

## 🌅 Setup Inicial (30 min)

- [ ] ☕ Ambiente de desenvolvimento pronto
- [ ] 🔧 Supabase local rodando (`supabase start`)
- [ ] 🔧 Edge Functions servindo (`npx supabase functions serve`)
- [ ] 🔧 Frontend dev server (`npm run dev`)
- [ ] 📝 Git status limpo, branch atualizada

---

## 📦 Fase 1: Instalação de Dependências (30 min)

### Solana Wallet Adapter
- [ ] Instalar pacotes:
  ```bash
  npm install @solana/wallet-adapter-react \
              @solana/wallet-adapter-react-ui \
              @solana/wallet-adapter-wallets \
              @solana/wallet-adapter-base \
              @solana/web3.js
  ```
- [ ] Verificar instalação no `package.json`

### Solana Pay
- [ ] Instalar `@solana/pay`:
  ```bash
  npm install @solana/pay
  ```
- [ ] Instalar `qrcode.react` para QR codes:
  ```bash
  npm install qrcode.react
  ```

### Utilities
- [ ] Instalar `bs58` para encoding:
  ```bash
  npm install bs58
  ```

**Commit:** `chore: add Solana dependencies (wallet-adapter, pay, qrcode)`

---

## 🔌 Fase 2: Wallet Adapter Setup (1-2h)

### Context Provider
- [ ] Criar `src/contexts/SolanaProvider.tsx`
  - [ ] Configurar `ConnectionProvider`
  - [ ] Configurar `WalletProvider` com wallets (Phantom, Backpack, Solflare)
  - [ ] Adicionar cluster selector (devnet/mainnet-beta)
  - [ ] Exportar hook `useSolanaContext()`

### Integration
- [ ] Envolver `App.tsx` com `SolanaProvider`
- [ ] Adicionar CSS do wallet-adapter:
  ```typescript
  import '@solana/wallet-adapter-react-ui/styles.css';
  ```

### UI Components
- [ ] Adicionar `WalletMultiButton` no `HeaderBar.tsx`
- [ ] Criar componente `ClusterSelector.tsx` (opcional)
- [ ] Testar conexão com Phantom no devnet

**DoD:** Conseguir conectar/desconectar Phantom wallet via UI

**Commit:** `feat: integrate Solana Wallet Adapter with multi-wallet support`

---

## 💳 Fase 3: Solana Pay Integration (2-3h)

### Hook `useSolanaPay`
- [ ] Criar `src/hooks/useSolanaPay.ts`
  - [ ] `generateReference()` - gerar PublicKey única
  - [ ] `createPaymentRequest()` - criar Solana Pay URL
  - [ ] `encodePaymentURL()` - usar `@solana/pay`
  - [ ] `validatePayment()` - chamar Edge Function

### Component `SolanaPayQR`
- [ ] Criar `src/components/SolanaPayQR.tsx`
  - [ ] Exibir QR Code com `qrcode.react`
  - [ ] Countdown timer (5-10 min)
  - [ ] Botão "Regenerar QR"
  - [ ] Botão "Copiar Link"
  - [ ] Estados: `generating | active | expired | paid`

### Integration no POS
- [ ] Modificar `src/pages/POS.tsx`
  - [ ] Adicionar opção "Pagar com Solana"
  - [ ] Renderizar `SolanaPayQR` quando invoice criada
  - [ ] Passar `amount`, `reference`, `recipient`

**DoD:** QR Code gerado em < 2s, copiável, com timer funcionando

**Commit:** `feat: implement Solana Pay QR code generation`

---

## ✅ Fase 4: Payment Validation (1-2h)

### Polling Service
- [ ] Criar `src/services/solanaPaymentService.ts`
  - [ ] `pollPaymentStatus()` - polling a cada 3s
  - [ ] Chamar `/validate-payment` Edge Function
  - [ ] Timeout após 10 minutos
  - [ ] Retry logic para erros temporários

### UI Feedback
- [ ] Atualizar `SolanaPayQR.tsx`
  - [ ] Indicador de "Aguardando pagamento..."
  - [ ] Spinner enquanto valida
  - [ ] Success animation quando confirmado
  - [ ] Error handling visual

### Realtime Updates
- [ ] Verificar subscription do Supabase em `useReceipts.ts`
- [ ] Confirmar atualização automática da UI quando status muda
- [ ] Testar com múltiplos recibos simultâneos

**DoD:** Pagamento confirmado on-chain reflete na UI em < 10s

**Commit:** `feat: implement on-chain payment validation with polling`

---

## 🪙 Fase 5: BRZ Token Support (1h)

### Token Configuration
- [ ] Adicionar env vars:
  - `VITE_BRZ_MINT_DEVNET=...`
  - `VITE_BRZ_MINT_MAINNET=...`
- [ ] Criar `src/lib/solana-config.ts`
  - [ ] Exportar mints por cluster
  - [ ] Exportar RPC URLs
  - [ ] Exportar merchant recipient

### Amount Handling
- [ ] Instalar `precise-money` (se ainda não instalado):
  ```bash
  npm install precise-money
  ```
- [ ] Criar `src/lib/money-utils.ts`
  - [ ] `brlToCents(amount: string): bigint`
  - [ ] `centsToBRZ(cents: bigint, decimals: number): bigint`
  - [ ] `formatBRZ(amount: bigint, decimals: number): string`

### Update Payment Flow
- [ ] Modificar `useSolanaPay.ts`
  - [ ] Incluir `splToken` (BRZ mint) no `encodeURL()`
  - [ ] Converter BRL → BRZ usando `precise-money`
  - [ ] Validar decimals do token

**DoD:** Pagamentos com BRZ funcionando no devnet

**Commit:** `feat: add BRZ stablecoin support with precise-money`

---

## 🧪 Fase 6: Testing & Validation (1h)

### Manual Testing
- [ ] **Teste 1:** Criar cobrança R$ 10.00
  - [ ] QR aparece em < 2s
  - [ ] Link copiável funciona
  - [ ] Timer decrementa corretamente

- [ ] **Teste 2:** Pagar com Phantom (devnet)
  - [ ] Escanear QR ou colar link
  - [ ] Aprovar transação
  - [ ] Aguardar confirmação (< 10s)
  - [ ] UI atualiza para "Confirmado"

- [ ] **Teste 3:** QR expiration
  - [ ] Esperar timer zerar
  - [ ] Botão "Regenerar" aparece
  - [ ] Novo QR funciona

- [ ] **Teste 4:** Multi-wallet
  - [ ] Testar com Phantom
  - [ ] Testar com Backpack (se disponível)
  - [ ] Testar com Solflare (se disponível)

### Edge Cases
- [ ] Transação rejeitada pelo usuário
- [ ] Network timeout
- [ ] Valor incorreto enviado
- [ ] Token incorreto enviado
- [ ] Múltiplos pagamentos para mesmo QR

**DoD:** Todos os testes manuais passando sem erros críticos

---

## 📝 Fase 7: Documentation (30 min)

- [ ] Atualizar `README.md`
  - [ ] Adicionar seção "Solana Integration"
  - [ ] Documentar env vars necessárias
  - [ ] Adicionar screenshots do QR Code

- [ ] Atualizar `.env.example`
  - [ ] Adicionar variáveis Solana
  - [ ] Comentar cada variável

- [ ] Atualizar `CHECKLIST_BR.md`
  - [ ] Marcar ✅ itens concluídos da Semana A
  - [ ] Atualizar progresso geral para ~75%

**Commit:** `docs: update documentation for Solana integration`

---

## 🎯 Definition of Done - Day 1

### Funcional
- [x] ~~Backend e Edge Functions rodando~~ (já estava pronto)
- [ ] Wallet Adapter integrado com multi-wallet
- [ ] Solana Pay QR gerado em < 2s
- [ ] Pagamento confirmado on-chain em < 10s
- [ ] BRZ token suportado
- [ ] UI responsiva com feedback de estado

### Técnico
- [ ] Zero erros no console (warnings ok)
- [ ] TypeScript sem erros
- [ ] Commits granulares e descritivos
- [ ] `.env.example` atualizado

### Testes
- [ ] Fluxo completo testado no devnet
- [ ] Pelo menos 2 wallets testadas
- [ ] Edge cases principais cobertos

---

## 📊 Progress Tracker

**Início:** ____:____
**Fase 1 concluída:** ____:____
**Fase 2 concluída:** ____:____
**Fase 3 concluída:** ____:____
**Fase 4 concluída:** ____:____
**Fase 5 concluída:** ____:____
**Fase 6 concluída:** ____:____
**Fim:** ____:____

**Total de horas:** ____h

---

## 🚀 Próximos Passos (Day 2)

- Refinar UX do fluxo de pagamento
- Adicionar mais feedback visual
- Implementar retry automático
- Preparar para mainnet
- Testar com valores reais no devnet

---

## 📝 Notas & Blockers

_Use este espaço para anotar descobertas, problemas encontrados, ou ideias durante o desenvolvimento._

---

**🔥 Let's ship it! 🔥**

