# 🧪 Jupiter Multi-Token - Testing Guide

**URL:** http://localhost:8080  
**Status:** Ready to test!

---

## ✅ TEST 1: TokenSelector UI

### **Steps:**
1. Open **http://localhost:8080**
2. Login (if needed)
3. Go to **POS** tab

### **What to check:**
```
✅ TokenSelector card visible (purple theme)
✅ "Multi-Token Support" title
✅ "Powered by Jupiter" badge
✅ Auto-swap toggle (OFF by default)
✅ Info alert explaining flow
```

### **Toggle Auto-Swap ON:**
```
✅ Input token dropdown appears
✅ Output token dropdown appears
✅ Arrow between them (visual flow)
✅ Info alert updates
```

---

## ✅ TEST 2: Token Dropdowns

### **Input Token Dropdown:**
```
Click dropdown and verify:
✅ Shows 9+ tokens (mainnet) or 2 (devnet)
✅ Token logos visible
✅ Token symbols: SOL, USDC, BONK, JUP, etc
✅ Token names: "Solana", "USD Coin", etc
✅ Selection works
```

### **Output Token Dropdown (Settlement):**
```
Click dropdown and verify:
✅ Shows 3-4 stable tokens
✅ BRZ (Brazil) 🇧🇷
✅ USDC (USA) 🇺🇸
✅ EURC (Europe) 🇪🇺
✅ USDT (backup)
✅ Selection works
```

---

## ✅ TEST 3: Payment Flow (Direct Mode)

### **Scenario: Single token (no swap)**
```
1. Auto-swap: OFF
2. Output token: tBRZ (devnet)
3. Enter amount: R$ 10.00
4. Generate QR
5. Pay with wallet (if you have tBRZ)

Expected:
✅ QR generated with tBRZ mint
✅ Payment works as before
✅ No swap involved
```

---

## ✅ TEST 4: Multi-Token UI (Visual Only)

### **Scenario: Display multi-token support**
```
1. Auto-swap: ON
2. Input: SOL
3. Output: tBRZ
4. Enter amount: R$ 10.00
5. Generate QR

Expected:
✅ QR generated with SOL mint (not tBRZ!)
✅ UI shows: "Customer pays with SOL"
✅ UI shows: "You receive tBRZ"
✅ Arrow indicates conversion
```

**Note:** Actual swap not implemented yet (V1.1 feature)
**Current:** Merchant receives token customer paid with

---

## ✅ TEST 5: Different Token Configurations

### **Test Matrix:**
```
Config 1: SOL → tBRZ (devnet)
Config 2: SOL → USDC (mainnet simulation)
Config 3: BONK → USDC (mainnet simulation)
Config 4: JUP → EURC (mainnet simulation)
```

**For each:**
- Change dropdowns
- See UI update
- Verify correct mint in QR (console logs)

---

## 📸 SCREENSHOTS TO TAKE

### **Priority Screenshots:**

1. **TokenSelector - Auto-Swap OFF**
   - Clean view
   - Single output dropdown
   - Info alert

2. **TokenSelector - Auto-Swap ON**
   - Both dropdowns visible
   - Arrow between them
   - "Powered by Jupiter" badge

3. **Input Token Dropdown**
   - Open dropdown
   - Show 9+ tokens with logos
   - Capture variety

4. **Output Token Dropdown**
   - Open dropdown
   - Show BRZ, USDC, EURC
   - Global reach visual

5. **POS with Multi-Token**
   - TokenSelector + Keypad
   - Full POS view
   - Professional look

6. **Console Logs (Debug)**
   - F12 console
   - Show token detection logs
   - Technical proof

7. **Payment with Different Token**
   - QR generated with SOL/BONK
   - Show mint address in debug panel
   - Proof of multi-token

---

## 🐛 TROUBLESHOOTING

### **TokenSelector not appearing:**
```
Cause: Code might not be compiled yet
Solution: 
1. Hard refresh (Ctrl+Shift+R)
2. Check console for errors
3. Restart dev server: npm run dev
```

### **Dropdowns empty:**
```
Cause: Token list not loading
Solution:
1. Check console: import errors?
2. Verify src/lib/tokens.ts exists
3. Check network (mainnet vs devnet)
```

### **Can't select tokens:**
```
Cause: State not updating
Solution:
1. Check React DevTools
2. Verify onChange handlers
3. Console logs should show selection
```

---

## ✅ SUCCESS CRITERIA

**Test passes if:**
- ✅ TokenSelector visible and styled
- ✅ Toggle works
- ✅ Dropdowns show tokens
- ✅ Token selection updates UI
- ✅ QR generated with correct token
- ✅ Console logs show correct mint
- ✅ No errors in console

**Bonus:**
- ✅ Logos load for all tokens
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Professional look

---

## 📊 WHAT'S WORKING (V1.0)

```
✅ Accept multiple tokens (UI selection)
✅ QR generated with chosen token
✅ Merchant receives chosen token
✅ Beautiful UI with Jupiter branding
```

## 🔮 WHAT'S COMING (V1.1)

```
⏳ Auto-swap execution (post-payment)
⏳ Merchant config: "Always convert to stable"
⏳ Backend swap (merchant hot wallet)
⏳ Batch swaps (gas optimization)
```

---

**READY TO TEST!** 🧪

**Open:** http://localhost:8080 → POS tab

**Look for:** Purple TokenSelector card above keypad! 🪐✨

