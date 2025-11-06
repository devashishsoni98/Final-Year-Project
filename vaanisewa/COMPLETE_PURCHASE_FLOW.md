# VaaniSewa Complete Purchase Flow Documentation

## Overview
This document provides end-to-end instructions for completing a purchase using voice commands in VaaniSewa.

---

## Prerequisites

### 1. Start Backend Server
```bash
cd BookStore/Backend
npm start
```
Backend runs on: `http://localhost:4001`

### 2. Start Frontend Server
```bash
cd vaanisewa
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 3. Browser Requirements
- Chrome, Edge, or Safari (Web Speech API support required)
- Microphone access permissions granted

### 4. Payment Setup
- Ensure Razorpay keys are configured in `.env`:
  - `VITE_RAZORPAY_KEY_ID=your_key_here`

---

## Complete Purchase Flow: Step-by-Step

### Flow 1: Create Account (First Time Users)

**Step 1: Start Signup**
```
User: "Sign up"
System: "Let's create your account. Please tell me your full name."
```

**Step 2: Provide Name**
```
User: "John Doe"
System: "I heard your name as John Doe. Say correct to confirm, or repeat to say it again."
User: "Correct"
```

**Step 3: Provide Email**
```
System: "Great! Now, please tell me your email address."
User: "john at example dot com"
System: "I heard john@example.com. Say correct to confirm, or repeat to say it again."
User: "Correct"
```

**Step 4: Provide Password**
```
System: "Perfect! Now, please tell me your password. It must be at least 6 characters."
User: "password123"
System: "Password received. Say correct to confirm, or repeat to say it again."
User: "Correct"
```

**Step 5: Account Created**
```
System: "Account created successfully! Welcome, John Doe. You are now logged in. Say browse books to continue."
```

---

### Flow 2: Login (Existing Users)

**Step 1: Start Login**
```
User: "Log in"
System: "Let's log you in. Please tell me your email address."
```

**Step 2: Provide Email**
```
User: "john at example dot com"
System: "I heard john@example.com. Say correct to confirm, or repeat to say it again."
User: "Correct"
```

**Step 3: Provide Password**
```
System: "Great! Now, please tell me your password."
User: "password123"
System: "Password received. Say correct to confirm, or repeat to say it again."
User: "Correct"
```

**Step 4: Login Success**
```
System: "Login successful! Welcome back, John Doe. Say browse books to continue."
```

---

### Flow 3: Browse and Select Books

**Step 1: Start Browsing**
```
User: "Browse books"
System: "Showing items 1 through 5 of 20 results. Page 1 of 4.
Item 1: The Great Gatsby by F. Scott Fitzgerald, 10 hundred rupees.
Item 2: To Kill a Mockingbird by Harper Lee, 7 hundred rupees.
Item 3: The Catcher in the Rye by J.D. Salinger, 4 hundred rupees.
Item 4: 1984 by George Orwell, 9 hundred rupees.
Item 5: Pride and Prejudice by Jane Austen, 8 hundred rupees.
Say next for more, or a number to hear details."
```

**Navigation Commands:**
- `"Next"` - Next page
- `"Previous"` - Previous page
- `"Page 3"` - Jump to page 3
- `"First page"` - Go to first page
- `"Last page"` - Go to last page

**Filtering Commands:**
- `"Show fiction"` - Filter by category
- `"Search for Gatsby"` - Search by keyword
- `"Browse all"` - Clear filters

---

### Flow 4: View Book Details and Add to Cart

**Step 1: Request Details**
```
User: "Item 1"
System: "The Great Gatsby by F. Scott Fitzgerald. Published by Scribner. Category: Literature.
Price: 10 hundred rupees. A novel by F. Scott Fitzgerald that explores themes of decadence
and excess in the Jazz Age. Say add to cart to purchase, back to return to the list, or
next item to hear the next book."
```

**Step 2: Add to Cart**
```
User: "Add to cart"
System: "The Great Gatsby added to cart for 10 hundred rupees. Say view cart to checkout,
or back to continue browsing."
```

**Alternative: Navigate Details**
- `"Next item"` - View next book details
- `"Previous item"` - View previous book details
- `"Back"` - Return to book list

---

### Flow 5: View Cart

**Command (Works from Anywhere):**
```
User: "Cart" / "Card" / "Basket" / "View cart" / "Show cart"
System: "Cart has 1 items. Item 1: The Great Gatsby - 1 copy at 1000 rupees each.
Total: 1000 rupees. Say checkout to buy, continue shopping to add more, remove item
followed by a number, or clear cart to empty everything."
```

**Cart Management Commands:**
- `"Checkout"` - Proceed to payment
- `"Continue shopping"` - Return to browse
- `"Remove item 1"` - Remove specific item
- `"Clear cart"` - Empty entire cart
- `"Change quantity of item 1"` - Update item quantity

---

### Flow 6: Checkout Process

**Step 1: Initiate Checkout (Works from Anywhere)**
```
User: "Checkout" / "Check out" / "Pay now"
System: "Let me confirm your order. You have 1 item. Item 1: The Great Gatsby, 1 copy at 1000
rupees each. Subtotal: 1000 rupees. Is this correct? Say yes to continue or no to modify."
```

**Step 2: Confirm Order**
```
User: "Yes"
System: "Your final total is 1000 rupees. This amount will be charged to your account.
Say confirm to proceed with payment, or cancel to go back."
```

**Step 3: Final Confirmation**
```
User: "Confirm"
System: "Collecting delivery address. Please tell me your complete delivery address."
```

**Step 4: Provide Address**
```
User: "123 Main Street, New York, NY 10001"
System: "I heard: 123 Main Street, New York, NY 10001. Say correct to confirm, or repeat
to say it again."
User: "Correct"
```

**Step 5: Processing Payment**
```
System: "Processing payment. One moment please."
System: "Order created. Opening payment window. A payment window has opened on your screen.
Complete the payment using card, U P I, or net banking as shown. Say done when payment
is complete, or cancel to stop."
```

**Step 6: Complete Razorpay Payment**
- Razorpay modal opens automatically
- Choose payment method:
  - **Card**: Enter card details
  - **UPI**: Use UPI ID or QR code
  - **Net Banking**: Select bank and login

**Step 7: After Payment Success**
```
User: "Done"
System: "Verifying payment. Please wait."
System: "Payment successful! Your order [order_id] for 1 item totaling 1000 rupees has been
placed successfully. Items will be delivered to your address. Confirmation email sent.
Say browse books to continue shopping, or view orders to see your order history."
```

---

## Error Handling and Recovery

### Payment Cancelled
```
User: [Closes payment window]
System: "Payment window closed. Say retry to try again, or view cart to modify your order."
```

**Recovery Options:**
- `"Retry"` - Try payment again
- `"View cart"` - Modify order
- `"Keep shopping"` - Continue browsing

### Payment Failed
```
System: "Payment verification failed. Say retry to try again, keep shopping to browse,
or contact support."
```

**Recovery Options:**
- `"Retry"` - Attempt payment again (max 3 attempts)
- `"Keep shopping"` - Return to browsing
- Contact support if amount was deducted

### Empty Cart Error
```
User: "Checkout"
System: "Your cart is empty. Add items before checkout."
```

### Not Logged In Error
```
User: "Checkout"
System: "Please log in to checkout. Say log in to continue."
```

---

## All Available Voice Commands

### Authentication
- `"Sign up"` - Create new account
- `"Log in"` - Access existing account
- `"Log out"` - Sign out

### Browse & Search
- `"Browse books"` - View all books
- `"Next"` / `"Previous"` - Navigate pages
- `"Page [number]"` - Jump to specific page
- `"Search for [keyword]"` - Find books
- `"Show [category]"` - Filter by category
  - Categories: fiction, fantasy, thriller, biography, mystery, literature, classic, philosophy, teenage, adventure, education, law

### Product Details
- `"Item [number]"` - Hear book details (1-5)
- `"Next item"` - Next book details
- `"Previous item"` - Previous book details
- `"Back"` - Return to list

### Cart Management (Works Anytime)
- `"Cart"` / `"Card"` / `"Basket"` - View cart
- `"Add to cart"` - Add current book
- `"Remove item [number]"` - Remove item
- `"Clear cart"` - Empty cart
- `"Change quantity of item [number]"` - Update quantity

### Checkout (Works Anytime)
- `"Checkout"` / `"Check out"` - Start checkout
- `"Pay now"` - Proceed to payment
- `"Confirm"` - Confirm order
- `"Cancel"` - Cancel checkout
- `"Retry"` - Retry failed payment

### Navigation
- `"Continue shopping"` - Return to browse
- `"Back"` - Go back
- `"Help"` - Get help
- `"Cancel"` - Stop current action

---

## Voice Command Tips

### Speaking Clearly
- Speak at normal pace
- Wait for system to finish before responding
- Use natural phrases

### Email Addresses
- Say "at" for @
- Say "dot" for periods
- Example: "john at example dot com" → john@example.com

### Numbers
- Supported: "one" through "ten"
- Also: "first", "second", "third", etc.
- Or: digits "1", "2", "3", etc.

### Confirmations
- **Positive**: "yes", "correct", "confirm", "ok"
- **Negative**: "no", "wrong", "repeat", "again"

---

## Payment Flow States

### State 1: Review Order
- Confirms items, quantities, and total
- Options: yes/no

### State 2: Confirm Total
- Final amount confirmation
- Options: confirm/cancel

### State 3: Collect Address
- User provides delivery address
- Options: correct/repeat

### State 4: Create Order
- Backend creates Razorpay order
- Automatic progression

### State 5: Await Payment
- Razorpay modal opens
- User completes payment on screen
- Options: done/cancel

### State 6: Verify Payment
- Backend verifies payment signature
- Order saved to database
- Cart cleared on success

---

## Testing Checklist

### Basic Flow
- [ ] Create account via voice
- [ ] Login via voice
- [ ] Browse books
- [ ] View book details
- [ ] Add book to cart
- [ ] View cart
- [ ] Checkout
- [ ] Complete payment
- [ ] Verify order success

### Error Scenarios
- [ ] Checkout with empty cart
- [ ] Checkout without login
- [ ] Cancel payment window
- [ ] Retry failed payment
- [ ] Maximum retry attempts

### Cart Operations
- [ ] Add multiple items
- [ ] Remove specific item
- [ ] Update quantity
- [ ] Clear entire cart
- [ ] View cart from any flow

### Voice Recognition
- [ ] "Cart" vs "Card" recognition
- [ ] "Basket" alternative
- [ ] Email address parsing
- [ ] Number word recognition

---

## Troubleshooting

### Issue: "Your cart is empty" when cart has items
**Solution**: This was a stale state issue. Fixed by ensuring fresh cart data is fetched during checkout initialization.

### Issue: Payment window doesn't open
**Solution**: Check browser console for Razorpay script errors. Ensure script is loaded in `index.html`.

### Issue: Voice commands not recognized
**Solution**:
- Check microphone permissions
- Use Chrome/Edge/Safari
- Speak clearly and wait for system response

### Issue: Payment verification fails
**Solution**:
- Check backend logs for signature mismatch
- Verify Razorpay secret key is correct
- Ensure order ID matches

---

## Database Schema

### Payments Table
```sql
{
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  user: ObjectId (ref: User),
  book_name: String,
  transaction_details: String,
  delivery_address: String,
  date: Date
}
```

### Cart Storage
**localStorage key**: `vaanisewa_cart`
```json
{
  "items": [
    {
      "_id": "book_id",
      "name": "Book Name",
      "price": 1000,
      "quantity": 1,
      "author": "Author Name",
      "category": "Category"
    }
  ],
  "lastUpdated": "ISO Date String"
}
```

---

## API Endpoints Used

### Authentication
- `POST /user/signup` - Create account
- `POST /user/login` - Login

### Books
- `GET /book` - Fetch all books

### Payment
- `POST /api/payment/order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/user/:userId/orders` - Get user orders
- `GET /api/payment/user/:userId/last` - Get last order

---

## Success Criteria

A successful purchase flow includes:

1. User authenticated (logged in)
2. Book(s) added to cart
3. Cart persisted in localStorage
4. Checkout initiated with current cart data
5. Order reviewed and confirmed
6. Delivery address collected
7. Razorpay order created
8. Payment completed via Razorpay modal
9. Payment verified by backend
10. Order saved to database
11. Cart cleared
12. Confirmation message displayed

---

## Next Steps After Purchase

- View order history: `"View orders"`
- Continue shopping: `"Browse books"`
- Logout: `"Log out"`

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend is running
3. Check Razorpay dashboard for payment status
4. Review backend logs for API errors

---

**Last Updated**: Current session
**Version**: 1.0
**Tested Flows**: Complete end-to-end purchase flow
