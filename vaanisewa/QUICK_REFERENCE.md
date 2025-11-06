# VaaniSewa Quick Reference Guide

## Quick Start

### 1. Start Servers
```bash
# Terminal 1 - Backend
cd BookStore/Backend && npm start

# Terminal 2 - Frontend
cd vaanisewa && npm run dev
```

### 2. Open Browser
Navigate to: `http://localhost:5173`

### 3. Allow Microphone
Grant microphone permissions when prompted

---

## Complete Purchase: Fast Track

### Quickest Path to Purchase

```
1. "Sign up" → Provide name, email, password
2. "Browse books" → Say "item 1"
3. "Add to cart"
4. "Checkout" → Say "yes" → "confirm"
5. Provide address → Say "correct"
6. Complete payment in Razorpay modal
7. Say "done"
```

**Time**: ~2-3 minutes

---

## Essential Commands

### Must-Know Commands

| Command | Action |
|---------|--------|
| `"Browse books"` | See available books |
| `"Item 1"` | Hear book details |
| `"Add to cart"` | Add current book |
| `"Cart"` | View cart (works anywhere) |
| `"Checkout"` | Start purchase (works anywhere) |
| `"Help"` | Get assistance |
| `"Cancel"` | Stop current action |

---

## Cart Commands (Work Anytime!)

These commands interrupt any current flow:

- `"Cart"` / `"Card"` / `"Basket"`
- `"View cart"` / `"Show cart"`
- `"Checkout"` / `"Check out"`

---

## Voice Tips

### Speaking Format

**Emails:**
- Say: "john at example dot com"
- Becomes: john@example.com

**Numbers:**
- Say: "item one" or "item 1"
- Say: "page three" or "page 3"

**Confirmations:**
- Positive: "yes", "correct", "confirm"
- Negative: "no", "repeat", "wrong"

---

## Flow States Reference

### Browse Flow
```
browse-books → viewing list → item details → add to cart
```

### Cart Flow
```
view cart → checkout → review order → confirm → payment
```

### Checkout Flow
```
init → review-order → confirm-total → collect-address →
create-order → await-payment → verify-payment → success
```

---

## Common Issues

### "Cart is empty" during checkout
**Fix Applied**: System now uses fresh cart data during checkout initialization.

### Voice not recognized
**Solution**: Speak clearly, use Chrome/Edge/Safari, check microphone permissions.

### Payment window doesn't open
**Solution**: Check console for Razorpay script errors, ensure script loaded.

---

## Testing Scenarios

### Scenario 1: New User Purchase
```
1. Sign up
2. Browse books
3. Item 1
4. Add to cart
5. Checkout
6. Complete payment
```

### Scenario 2: Browse, Filter, Purchase
```
1. Login
2. Browse books
3. Show fiction
4. Item 2
5. Add to cart
6. Checkout
7. Complete payment
```

### Scenario 3: Multiple Items
```
1. Browse books
2. Item 1 → Add to cart → Back
3. Item 2 → Add to cart
4. View cart
5. Checkout
6. Complete payment
```

---

## Error Recovery Paths

### Payment Cancelled
```
System: "Payment window closed..."
→ Say: "Retry" (try again)
→ Say: "View cart" (modify order)
→ Say: "Keep shopping" (continue browsing)
```

### Empty Cart
```
System: "Your cart is empty..."
→ Say: "Browse books"
```

### Not Logged In
```
System: "Please log in to checkout..."
→ Say: "Log in"
```

---

## Payment Methods Supported

Via Razorpay Modal:
1. Credit/Debit Card
2. UPI
3. Net Banking
4. Wallets

---

## Key Features

- Global cart/checkout commands (work from anywhere)
- Multi-alternative voice recognition ("cart"/"card"/"basket")
- Confirmation system (prevents errors)
- Retry mechanism (max 3 attempts)
- Persistent cart (localStorage)
- Real-time TTS feedback

---

## Performance Notes

- Browse load: <500ms
- Category filter: Instant (client-side)
- Search: Instant (client-side)
- Pagination: Instant (client-side)
- TTS reading: ~2 seconds per book

---

## Browser Requirements

- Chrome (recommended)
- Edge
- Safari

Not supported:
- Firefox (limited Speech API)
- Mobile browsers (experimental)

---

## Environment Variables

Required in `.env`:
```
VITE_API_BASE_URL=http://localhost:4001
VITE_APP_NAME=VaaniSewa
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

---

## Debugging

### Check Cart State
```javascript
// Browser console
JSON.parse(localStorage.getItem('vaanisewa_cart'))
```

### Check Auth State
```javascript
// Browser console
JSON.parse(localStorage.getItem('user'))
```

### Check Backend Connection
```bash
curl http://localhost:4001/book
```

---

## Quick Commands Reference

### Navigation
- Next, Previous, Page [number], First page, Last page

### Search & Filter
- Search for [keyword], Show [category], Browse all

### Cart Operations
- Add to cart, Remove item [number], Clear cart, Change quantity

### Checkout
- Checkout, Confirm, Cancel, Retry

---

## Support Checklist

If something doesn't work:
1. ☐ Backend running on port 4001?
2. ☐ Frontend running on port 5173?
3. ☐ Microphone permissions granted?
4. ☐ Using Chrome/Edge/Safari?
5. ☐ Razorpay key configured?
6. ☐ Check browser console for errors
7. ☐ Check backend logs

---

## Documentation Files

- `COMPLETE_PURCHASE_FLOW.md` - Detailed end-to-end guide
- `QUICK_REFERENCE.md` - This file (quick reference)
- `BROWSE_TESTING.md` - Browse feature testing guide
- `TESTING.md` - Authentication testing guide
- `CART_CHECKOUT_FIXES.md` - Technical fixes documentation

---

**Pro Tip**: Say "cart" or "checkout" at any time to access those features immediately!
