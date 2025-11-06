# VaaniSewa Flow Diagrams

## Complete Purchase Flow Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                    START: User Opens App                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Not Logged In? │
                    └────┬────────┬───┘
                    Yes  │        │ No
                         ▼        └──────────────┐
              ┌──────────────────┐               │
              │  Authentication  │               │
              │      Flow        │               │
              └────────┬─────────┘               │
                       │                         │
                       ▼                         ▼
              ┌──────────────────────────────────────────┐
              │        User Authenticated                 │
              └────────────────┬─────────────────────────┘
                               │
                               ▼
              ┌──────────────────────────────────────────┐
              │         Browse Books Flow                 │
              │                                           │
              │  • View all books (paginated)            │
              │  • Filter by category                    │
              │  • Search by keyword                     │
              │  • Navigate pages (next/prev)            │
              └────────────────┬─────────────────────────┘
                               │
                               ▼
              ┌──────────────────────────────────────────┐
              │      Product Details Flow                 │
              │                                           │
              │  User: "Item 1"                          │
              │  System: [Reads full book details]       │
              └────────────────┬─────────────────────────┘
                               │
                               ▼
              ┌──────────────────────────────────────────┐
              │         Add to Cart                       │
              │                                           │
              │  User: "Add to cart"                     │
              │  System: "Added to cart"                 │
              │  Cart: localStorage updated              │
              └────────────────┬─────────────────────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
    ┌──────────────────────┐   ┌──────────────────────┐
    │  Continue Shopping?  │   │    View Cart?        │
    │                      │   │                      │
    │  User: "Back"        │   │  User: "Cart"        │
    └──────────┬───────────┘   └──────────┬───────────┘
               │                           │
               │ (Loop to Browse)          │
               │                           ▼
               │              ┌──────────────────────────┐
               │              │      Cart Flow            │
               │              │                          │
               │              │  • View all items        │
               │              │  • Remove items          │
               │              │  • Update quantities     │
               │              │  • Clear cart            │
               │              └──────────┬───────────────┘
               │                         │
               └────────────┐            │
                            │            ▼
                            │   ┌───────────────────┐
                            │   │   Ready to Buy?   │
                            │   └────────┬──────────┘
                            │            │
                            │            ▼
              ┌─────────────┴────────────────────────────┐
              │          Checkout Flow Starts            │
              └────────────────┬─────────────────────────┘
                               │
                               ▼
              ┌──────────────────────────────────────────┐
              │  Step 1: Review Order                    │
              │                                           │
              │  System: "You have 1 item..."            │
              │  User: "Yes"                             │
              └────────────────┬─────────────────────────┘
                               │
                               ▼
              ┌──────────────────────────────────────────┐
              │  Step 2: Confirm Total                   │
              │                                           │
              │  System: "Total: 1000 rupees..."         │
              │  User: "Confirm"                         │
              └────────────────┬─────────────────────────┘
                               │
                               ▼
              ┌──────────────────────────────────────────┐
              │  Step 3: Collect Address                 │
              │                                           │
              │  System: "Tell me delivery address..."   │
              │  User: "123 Main St..."                  │
              │  User: "Correct"                         │
              └────────────────┬─────────────────────────┘
                               │
                               ▼
              ┌──────────────────────────────────────────┐
              │  Step 4: Create Razorpay Order           │
              │                                           │
              │  Backend: POST /api/payment/order        │
              │  Response: order_id, amount, currency    │
              └────────────────┬─────────────────────────┘
                               │
                               ▼
              ┌──────────────────────────────────────────┐
              │  Step 5: Razorpay Modal Opens            │
              │                                           │
              │  User sees payment options:              │
              │  • Credit/Debit Card                     │
              │  • UPI                                   │
              │  • Net Banking                           │
              │  • Wallets                               │
              └────────┬───────────────┬─────────────────┘
                       │               │
           ┌───────────┘               └─────────────┐
           │                                         │
           ▼                                         ▼
  ┌──────────────────┐                   ┌──────────────────┐
  │  Payment Success │                   │ Payment Cancelled│
  │                  │                   │                  │
  │  Razorpay sends  │                   │  User closes     │
  │  payment_id      │                   │  modal           │
  │  signature       │                   └────────┬─────────┘
  └────────┬─────────┘                            │
           │                                      │
           ▼                                      ▼
  ┌──────────────────────────────────┐  ┌───────────────────┐
  │  User: "Done"                    │  │ Retry or Cancel?  │
  └────────┬─────────────────────────┘  │                   │
           │                             │ User: "Retry"     │
           ▼                             └────────┬──────────┘
  ┌──────────────────────────────────┐           │
  │  Step 6: Verify Payment          │           │ (Loop back
  │                                  │           │  to Step 4)
  │  Backend: POST /api/payment/verify│          │
  │  Validates signature             │           │
  │  Saves order to DB               │           │
  └────────┬─────────────────────────┘           │
           │                                      │
           ▼                                      │
  ┌──────────────────────────────────┐           │
  │  Payment Verification Result     │           │
  └────────┬────────────┬────────────┘           │
           │            │                         │
    Success│            │Failure                  │
           │            └─────────────────────────┘
           ▼
  ┌──────────────────────────────────┐
  │  Order Confirmed                 │
  │                                  │
  │  • Cart cleared                  │
  │  • Order saved                   │
  │  • Confirmation message          │
  └────────────────┬─────────────────┘
                   │
                   ▼
  ┌──────────────────────────────────┐
  │  Post-Purchase Options           │
  │                                  │
  │  • "Browse books" (shop more)   │
  │  • "View orders" (order history)│
  │  • "Log out"                    │
  └──────────────────────────────────┘
```

---

## Authentication Flow (Signup)

```
Start Signup
     │
     ▼
Collect Fullname ──► Confirm ──┐
     ▲                         │
     │                   No/Repeat
     └─────────────────────────┘
     │
     │ Yes/Correct
     ▼
Collect Email ──────► Confirm ──┐
     ▲                         │
     │                   No/Repeat
     └─────────────────────────┘
     │
     │ Yes/Correct
     ▼
Collect Password ───► Confirm ──┐
     ▲                         │
     │                   No/Repeat
     └─────────────────────────┘
     │
     │ Yes/Correct
     ▼
Submit to Backend
     │
     ├──► Success: Login user
     │
     └──► Error: Show error message
              │
              └──► "Email exists" → Suggest login
```

---

## Browse Flow State Machine

```
┌────────────────┐
│  init          │ ◄─────────────────────┐
│  (Load books)  │                       │
└────────┬───────┘                       │
         │                               │
         ▼                               │
┌────────────────────────────────────────┤
│        browsing                        │
│                                        │
│  Commands:                             │
│  • "search for [query]" → filter      │
│  • "show [category]" → filter         │
│  • "next/previous" → paginate         │
│  • "item [number]" → details flow     │
│  • "browse all" → reset filters       │
└────────┬───────────────────────────────┘
         │
         ├──► "item [number]" → Product Details Flow
         │
         ├──► "search/category" → Update filteredBooks
         │                         └──► Stay in browsing
         │
         └──► "cart/checkout" → Exit to Cart/Checkout Flow
```

---

## Product Details Flow

```
┌───────────────┐
│  init         │
│  (User: Item #)│
└────────┬──────┘
         │
         ▼
┌────────────────────────┐
│  details-shown         │
│                        │
│  Book details read     │
│  aloud to user         │
└────┬──────────────┬────┘
     │              │
     │              ├──► "add to cart" → Add & stay
     │              │
     │              ├──► "next item" → Next book details
     │              │
     │              ├──► "previous item" → Prev book details
     │              │
     │              └──► "back" → Return to browse flow
     │
     ▼
  End Flow
```

---

## Cart Flow State Machine

```
┌───────────────┐
│  init         │
│  (Entry)      │
└────────┬──────┘
         │
         ├──► Empty cart? → "empty-cart" state
         │
         └──► Has items? → "viewing-cart" state
                           │
                           ▼
              ┌────────────────────────────┐
              │  viewing-cart              │
              │                            │
              │  Commands:                 │
              │  • "checkout"              │
              │  • "continue shopping"     │
              │  • "remove item [#]"       │
              │  • "clear cart"            │
              │  • "change quantity"       │
              └────────┬───────────────────┘
                       │
                       ├──► "checkout" → Exit to Checkout Flow
                       │
                       ├──► "remove item" → confirm-remove state
                       │                     └──► Yes → Remove & back to viewing
                       │                     └──► No → Back to viewing
                       │
                       ├──► "clear cart" → confirm-clear state
                       │                   └──► Yes → Clear & empty-cart state
                       │                   └──► No → Back to viewing
                       │
                       └──► "continue shopping" → Exit to Browse Flow
```

---

## Checkout Flow State Machine

```
┌────────────────┐
│  init          │
│  (Start)       │
└────────┬───────┘
         │
         ├──► Empty cart? → Error & exit
         │
         ├──► Not logged in? → Error & exit
         │
         └──► All valid? → "review-order"
                           │
                           ▼
              ┌────────────────────────────┐
              │  review-order              │
              │  System reads items        │
              └────┬──────────────┬────────┘
                   │              │
              "yes"│              │"no"
                   │              └──► Exit (back to cart)
                   ▼
              ┌────────────────────────────┐
              │  confirm-total             │
              │  System states final price │
              └────┬──────────────┬────────┘
                   │              │
          "confirm"│              │"cancel"
                   │              └──► Exit (back to cart)
                   ▼
              ┌────────────────────────────┐
              │  collect-address           │
              │  User provides address     │
              └────────┬───────────────────┘
                       │
                       ▼
              ┌────────────────────────────┐
              │  confirm-address           │
              └────┬──────────────┬────────┘
                   │              │
           "correct"│              │"repeat"
                   │              └──► Back to collect-address
                   ▼
              ┌────────────────────────────┐
              │  create-order              │
              │  Backend creates Razorpay  │
              └────────┬───────────────────┘
                       │
                       ├──► Success → "await-payment"
                       │              └──► Razorpay modal opens
                       │
                       └──► Error → "error" state
                                     └──► Retry up to 3 times
              ┌────────────────────────────┐
              │  await-payment             │
              │  User completes payment    │
              └────┬──────────────┬────────┘
                   │              │
             "done"│              │"cancel"
                   │              └──► "error" state
                   ▼
              ┌────────────────────────────┐
              │  verify-payment            │
              │  Backend verifies signature│
              └────┬──────────────┬────────┘
                   │              │
            Success│              │Failure
                   │              └──► "error" state
                   ▼
              ┌────────────────────────────┐
              │  SUCCESS                   │
              │  • Cart cleared            │
              │  • Order saved             │
              │  • Flow ends               │
              └────────────────────────────┘
```

---

## Error Handling Flow

```
                      ┌─────────────────┐
                      │   Error State   │
                      └────────┬────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌──────────────┐  ┌─────────┐  ┌──────────────┐
        │  "retry"     │  │ "cancel"│  │ "keep        │
        │              │  │         │  │  shopping"   │
        └──────┬───────┘  └────┬────┘  └──────┬───────┘
               │               │              │
               ▼               ▼              ▼
        ┌──────────────┐  ┌─────────┐  ┌──────────────┐
        │  Retry count │  │  Exit   │  │  Exit to     │
        │  < 3?        │  │  flow   │  │  browse      │
        └──────┬───┬───┘  └─────────┘  └──────────────┘
               │   │
          Yes  │   │ No
               │   └──► "Max attempts" → Exit
               │
               └──► Back to create-order
```

---

## Global Command Interception

```
┌─────────────────────────────────────────────┐
│         Any Active Flow                     │
│                                             │
│  • browse-books                            │
│  • product-details                         │
│  • auth-signup                             │
│  • auth-login                              │
│                                             │
└──────────────┬──────────────────────────────┘
               │
               │ User says: "cart" / "checkout"
               │
               ▼
┌──────────────────────────────────────────────┐
│  Command Parser Detects Global Intent       │
└──────────────┬───────────────────────────────┘
               │
               ├──► Intent: "viewCart"
               │    • Save current flow state
               │    • End current flow
               │    • Start cart flow
               │
               └──► Intent: "checkout"
                    • Validate: logged in?
                    • Validate: cart not empty?
                    • End current flow
                    • Start checkout flow
```

---

## Data Flow: Cart Operations

```
┌──────────────┐
│  User Action │
│  "Add to Cart"│
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│  CartContext.addItem()           │
│                                  │
│  • Validate book object          │
│  • Check quantity (1-10)         │
│  • Update items state            │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  useEffect Hook Triggers         │
│                                  │
│  • Serialize cart data           │
│  • localStorage.setItem()        │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Cart Persisted                  │
│                                  │
│  Key: "vaanisewa_cart"           │
│  Value: {items, lastUpdated}     │
└──────────────────────────────────┘
```

---

## Payment Verification Flow

```
┌────────────────────────┐
│  Razorpay Modal        │
│  Payment Success       │
└──────────┬─────────────┘
           │
           │ Returns: payment_id, order_id, signature
           │
           ▼
┌──────────────────────────────────────────────┐
│  Frontend Handler                            │
│                                              │
│  dialogueManager.handlePaymentResponse()    │
│  • Sets flowState.step = 'verify-payment'  │
│  • Stores payment details in state          │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│  User says: "done"                           │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│  CheckoutFlow processes 'verify-payment' step│
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│  Backend: POST /api/payment/verify           │
│                                              │
│  Body:                                       │
│  • razorpay_order_id                        │
│  • razorpay_payment_id                      │
│  • razorpay_signature                       │
│  • user (userId)                            │
│  • book_name                                │
│  • transaction_details                      │
│  • delivery_address                         │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│  Backend Verification                        │
│                                              │
│  1. Create expected signature:               │
│     HMAC-SHA256(order_id|payment_id, secret)│
│                                              │
│  2. Compare with razorpay_signature         │
└──────────┬──────────────┬────────────────────┘
           │              │
     Match │              │ Mismatch
           │              │
           ▼              ▼
  ┌────────────────┐  ┌──────────────┐
  │  Save Payment  │  │  Error 400   │
  │  to Database   │  │  "Invalid    │
  │                │  │  Signature"  │
  └────────┬───────┘  └──────────────┘
           │
           ▼
  ┌────────────────────────────┐
  │  Response 200              │
  │  {message: "Payment        │
  │   Successfully"}           │
  └────────┬───────────────────┘
           │
           ▼
  ┌────────────────────────────┐
  │  Frontend Success Handler  │
  │                            │
  │  • Clear cart              │
  │  • Show success message    │
  │  • End checkout flow       │
  └────────────────────────────┘
```

---

## Context State Management

```
┌──────────────────────────────────────────┐
│  React Context Providers                 │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  AuthProvider                      │ │
│  │  • user                            │ │
│  │  • token                           │ │
│  │  • login()                         │ │
│  │  • logout()                        │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  CartProvider                      │ │
│  │  • items[]                         │ │
│  │  • total                           │ │
│  │  • addItem()                       │ │
│  │  • removeItem()                    │ │
│  │  • clearCart()                     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  DialogueProvider                  │ │
│  │  • messages[]                      │ │
│  │  • isListening                     │ │
│  │  • addUserMessage()                │ │
│  │  • addSystemMessage()              │ │
│  └────────────────────────────────────┘ │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  VoiceDashboard Component                │
│                                          │
│  • Registers all flows                   │
│  • Handles voice commands                │
│  • Manages UI state                      │
│  • Coordinates TTS/STT                   │
└──────────────────────────────────────────┘
```

---

## Key Architectural Decisions

### 1. Global Cart/Checkout Commands
- Implemented as interceptors before flow processing
- Works from any flow state
- Preserves current flow for "back" functionality

### 2. Fresh Cart Data in Checkout
- `cartContext.getCartSummary()` called at checkout initiation
- Prevents stale state issues
- Ensures accurate totals

### 3. Voice Alternative Recognition
- "cart" / "card" / "basket" all work
- Handles common misrecognitions
- Improves user experience

### 4. Confirmation System
- Every input confirmed before proceeding
- "correct" / "repeat" pattern
- Prevents errors from voice misrecognition

### 5. Flow State Preservation
- Current flow state saved before interruption
- Allows seamless return to previous activity
- Maintains context across commands

---

This documentation provides complete visual reference for all flows in VaaniSewa.
