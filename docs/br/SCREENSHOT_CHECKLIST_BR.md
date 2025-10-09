# 📸 Checklist de Screenshots - Submission

## 🎯 Objetivo
Capturar imagens de qualidade para submission do Colosseum e Superteam Brazil.

---

## 📱 Screenshots Essenciais (7-10 imagens)

### 1. **Landing/Login** (opcional)
- [ ] Tela de login
- [ ] Onboarding (se tiver)

### 2. **POS - Criar Cobrança** ⭐
- [ ] Teclado numérico
- [ ] Valor digitado (ex: R$ 50.00)
- [ ] Botão "Gerar QR Code"
- **Caption:** "Create charge in seconds with intuitive UI"

### 3. **Solana Pay QR** ⭐⭐⭐
- [ ] QR Code grande e visível
- [ ] Timer (countdown)
- [ ] Botão "Pagar com Wallet Conectada"
- [ ] Botão "Copiar Link"
- [ ] Debug panel (mostra configuração)
- **Caption:** "Solana Pay QR with direct wallet payment option"

### 4. **Wallet Connection** (Desktop)
- [ ] Phantom conectada no header
- [ ] Endereço visível
- [ ] Botão destaque
- **Caption:** "Multi-wallet support with one-click payment"

### 5. **Transaction Confirmation** ⭐⭐
- [ ] Phantom approval screen (se possível)
- [ ] OU Transaction success message
- [ ] "Pagamento Confirmado!" na UI
- **Caption:** "Real on-chain confirmation in < 10 seconds"

### 6. **Receipt Detail** ⭐⭐⭐
- [ ] Detalhes do pagamento
- [ ] TX Hash clicável
- [ ] Status chip (verde "Confirmed")
- [ ] Settlement Panel (card azul)
- [ ] Botão "Settle to Bank"
- **Caption:** "Crypto payment with optional fiat settlement"

### 7. **Settlement Modal** ⭐⭐
- [ ] Modal aberto
- [ ] Provider dropdown (Wise/Circle)
- [ ] Currency selector
- [ ] Fee breakdown:
  ```
  Amount:      R$ 50.00
  Est. Fee:    ~R$ 0.50
  You Receive: ~R$ 49.50
  ```
- [ ] Warning message
- **Caption:** "Convert to fiat via Circle (USD) or Wise (50+ currencies)"

### 8. **Reports Dashboard** ⭐
- [ ] 4 cards principais (Total, Transactions, Avg Ticket, % Settled)
- [ ] 3 cards de Settlement Analytics:
  - Crypto Balance (azul)
  - Settled to Bank (verde)
  - Performance (roxo)
- **Caption:** "Real-time analytics with settlement tracking"

### 9. **Receipts List**
- [ ] Lista de payments
- [ ] Status chips variados
- [ ] Filtros (se tiver)
- **Caption:** "Complete payment history with status tracking"

### 10. **Solana Explorer** (opcional)
- [ ] Transaction no explorer.solana.com
- [ ] Details: From, To, Amount, Status
- [ ] Proof on-chain
- **Caption:** "Verified on Solana blockchain (devnet)"

---

## 🎨 Dicas de Qualidade

### Antes de tirar screenshots:

1. **Limpar console** (F12 → clear)
2. **Zoom 100%** (Ctrl + 0)
3. **Modo escuro OU claro** (escolha um e use em todas)
4. **Fechar tabs desnecessárias**
5. **Esconder elementos pessoais** (email, endereços completos)

### Durante:

- **Resolução:** Mínimo 1920x1080
- **Formato:** PNG (melhor qualidade) ou JPG
- **Crop:** Remover barras do navegador (opcional)
- **Highlight:** Adicionar setas/círculos depois (se necessário)

### Ferramentas:

- **Linux:** `gnome-screenshot` ou `flameshot`
- **Chrome:** DevTools → Device Toolbar (mobile view)
- **Editing:** GIMP, Krita, ou online (Photopea)

---

## 🎬 GIF Animado (Bonus!)

**Fluxo end-to-end:**
```
1. Digitar valor → 2s
2. Gerar QR → instant
3. Conectar wallet → 1s
4. Pagar → 2s
5. Confirmado → 5s
Total: ~10s
```

**Ferramentas:**
- **Record:** OBS Studio, SimpleScreenRecorder
- **Convert to GIF:** ffmpeg, Gifski, ezgif.com
- **Max size:** 10 MB
- **Duration:** 10-15 segundos
- **FPS:** 15-30

**Comando ffmpeg:**
```bash
# MP4 → GIF
ffmpeg -i screen-recording.mp4 -vf "fps=20,scale=800:-1:flags=lanczos" -c:v gif payment-flow.gif
```

---

## 📊 Organização dos Arquivos

```
screenshots/
├── 01-pos-create-charge.png
├── 02-solana-pay-qr.png
├── 03-wallet-connection.png
├── 04-transaction-confirm.png
├── 05-receipt-detail.png
├── 06-settlement-modal.png
├── 07-reports-dashboard.png
├── 08-receipts-list.png
├── 09-solana-explorer.png
└── payment-flow.gif (bonus)
```

---

## ✅ Checklist Pré-Submission

- [ ] 7-10 screenshots de qualidade
- [ ] 1 GIF do fluxo (bonus)
- [ ] Captions escritas (em inglês)
- [ ] Arquivos nomeados logicamente
- [ ] Sem informações pessoais visíveis
- [ ] Resolução adequada (HD)
- [ ] Formato consistente (PNG ou JPG)

---

## 🎯 Uso nas Submissions

**Colosseum:**
- Pode fazer upload direto no form
- Ou hospedar no GitHub (README)
- Ou usar Imgur/similar

**Pitch Deck:**
- Usar screenshots nos slides
- GIF na apresentação
- Before/After comparisons

**README:**
```markdown
## 📸 Screenshots

### Payment Flow
![POS](screenshots/01-pos-create-charge.png)
![QR Code](screenshots/02-solana-pay-qr.png)

### Settlement
![Settlement](screenshots/06-settlement-modal.png)
```

---

**Comece tirando os screenshots agora!** 📸

Quando terminar, me avise e **envie a API key da Wise** para configurarmos! 🔑

