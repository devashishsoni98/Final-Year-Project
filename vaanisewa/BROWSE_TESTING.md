# VaaniSewa Browse & Search Testing Guide

## Phase 3: Voice Book Browsing

### Prerequisites

1. **Backend Running**
   ```bash
   cd BookStore/Backend
   npm start
   ```

2. **Frontend Running**
   ```bash
   cd vaanisewa
   npm run dev
   ```

3. **Browser**: Chrome, Edge, or Safari with microphone access

---

## Test Scenarios

### 1. Basic Browse Flow

**Start Browsing:**
- Say: **"Browse books"**
- Expected: System reads first 5 books with "Showing items 1 through 5 of 20 results..."
- Visual: BookResultsList appears with 5 books

**Success Criteria:**
- All 5 books are read aloud
- Format: "Item 1: The Great Gatsby by F. Scott Fitzgerald, 10 hundred rupees"
- Visual list shows books with correct details

---

### 2. Pagination Commands

**Next Page:**
- Say: **"Next"** or **"More"** or **"Continue"**
- Expected: "Showing items 6 through 10 of 20 results..."
- Visual: List updates to show items 6-10

**Previous Page:**
- Say: **"Previous"** or **"Back"**
- Expected: Returns to previous page
- Visual: List updates accordingly

**Jump to Page:**
- Say: **"Page three"** or **"Go to page 3"**
- Expected: "Showing items 11 through 15 of 20 results..."

**First/Last Page:**
- Say: **"First page"** or **"Last page"**
- Expected: Jumps to specified page

**Edge Cases:**
- On last page, say **"Next"** → "You are on the last page. Say previous to go back."
- On first page, say **"Previous"** → "You are on the first page. Say next for more."

---

### 3. Category Filtering

**Fiction Books:**
- Say: **"Show fiction books"** or **"Show fiction"**
- Expected: Filters to Fiction category only
- Response: "Showing Fiction books. Showing items 1 through 5 of X results..."

**All Categories to Test:**
- Literature: "Show literature"
- Fantasy: "Show fantasy books"
- Thriller: "Show thrillers" or "Show suspense"
- Biography: "Show biographies" or "Show memoirs"
- Philosophy: "Show philosophy"
- Mystery: "Show mystery" or "Show detective"
- Teenage: "Show teen" or "Show young adult"

**Category Synonyms:**
- "Show novels" → Fiction
- "Show magic books" → Fantasy
- "Show memoirs" → Biography

**Invalid Category:**
- Say: **"Show science fiction"**
- Expected: "I couldn't find category science fiction. Try fiction, fantasy..."

**Return to All Books:**
- Say: **"Browse all"** or **"Show all books"**
- Expected: Clears filter, shows all books

---

### 4. Search Functionality

**Search by Title:**
- Say: **"Search for Gatsby"**
- Expected: Finds "The Great Gatsby"
- Response: "Showing items 1 through 1 of 1 results. Item 1: The Great Gatsby..."

**Search by Author:**
- Say: **"Find books by Tolkien"**
- Expected: Finds "The Hobbit"

**Search by Keyword:**
- Say: **"Search for dystopian"**
- Expected: Finds books with "dystopian" in description (1984, Hunger Games, Fahrenheit 451)

**Search Patterns to Test:**
- "Search for [query]"
- "Find books about [topic]"
- "Look for [query]"
- "Show books about [topic]"

**No Results:**
- Say: **"Search for quantum physics"**
- Expected: "No results found for quantum physics. Try different keywords, or say browse all to see all books."

**Search then Paginate:**
- Search for "fiction"
- Say **"Next"** → Navigates through fiction search results

---

### 5. Product Details Flow

**View Book Details:**
- While browsing, say: **"Item 3"** or **"Tell me about item 3"** or **"Read details for item 3"**
- Expected: Full book details read aloud
- Format: "[Title] by [Author]. Published by [Publisher]. Category: [Category]. Price: [Price]. [Description]."

**Details Commands:**
- "Item number three"
- "Tell me about item 2"
- "Read details for item one"
- "Details for book 4"

**Navigate Within Details:**

**Next Item:**
- Say: **"Next item"** or **"Next book"**
- Expected: Reads details for item 4

**Previous Item:**
- Say: **"Previous item"** or **"Previous book"**
- Expected: Reads details for item 2

**Return to List:**
- Say: **"Back"** or **"Go back"** or **"Return to list"**
- Expected: "Returning to book list." Returns to browse flow

**Edge Cases:**
- On last item, say **"Next item"** → "No more items on this page. Say back to return to list."
- On first item, say **"Previous item"** → "This is the first item. Say back to return to list."

---

### 6. Add to Cart

**From Details View:**
- Viewing item 1, say: **"Add to cart"**
- Expected: "The Great Gatsby added to cart for 10 hundred rupees. Say view cart to checkout, or back to continue browsing."

**Cart Storage:**
- Check localStorage: `voice-cart` should contain book data
- Format: `[{ id, name, author, price, quantity: 1 }]`

**Multiple Additions:**
- Add item 1
- Go back to list
- View item 2
- Add to cart
- Cart should have 2 items

---

### 7. Number Recognition

**Spoken Numbers:**
- "Item one" → 1
- "Item three" → 3
- "Item ten" → 10
- "Item number five" → 5
- "Book two" → 2

**Digit Numbers:**
- "Item 1" → 1
- "Item 4" → 4

**Ordinal Numbers:**
- "First item" → 1
- "Third item" → 3
- "Fifth book" → 5

---

### 8. Context Retention

**Test Sequence:**
1. Say **"Browse books"**
2. Say **"Show fantasy"** (filters to fantasy)
3. Say **"Next"** (next page of fantasy books)
4. Say **"Item 2"** (details for 2nd fantasy book on page 2)
5. Say **"Back"** (returns to fantasy page 2)
6. Say **"Browse all"** (shows all books)

**Success:** System remembers context at each step

---

### 9. Error Handling

**Invalid Item Number:**
- Say: **"Item 99"**
- Expected: "Item 99 is not available on this page. Say a number from 1 to 5."

**Invalid Page Number:**
- Say: **"Page 100"**
- Expected: "Page 100 does not exist. There are 4 pages total."

**API Failure:**
- Stop backend
- Say: **"Browse books"**
- Expected: "Sorry, I could not load books at this time. Please try again later."

---

### 10. Visual Feedback

**BookResultsList Component:**
- Shows 5 books per page
- Each book has:
  - Item number (1-5)
  - Book name
  - Author
  - Category badge
  - Price in green

**Currently Reading Indicator:**
- When details are being read, that item has:
  - Blue highlight
  - Pulsing microphone icon
  - Scaled up (105%)

**Click Interaction:**
- Click on any book card → triggers voice "Item [number]" command

---

## Voice UX Patterns

### Chunking Long Responses
- First 5 books read, then pause
- "Say next for more" prompt
- User can interrupt with commands

### Quick Navigation Hints
- After listing books: "Say a number to hear details, or next for more"
- After details: "Say add to cart, back, or next item"
- After search: "Say next for more, or browse all to see everything"

### Search Refinement
- No results: suggests alternative actions
- Suggests categories if search is category-related
- Always offers "browse all" as fallback

---

## Performance Expectations

- **Browse load**: < 500ms
- **Category filter**: Instant (client-side)
- **Search**: Instant (client-side)
- **Pagination**: Instant (client-side)
- **TTS reading**: ~2 seconds per book

---

## Accessibility Features

1. **Large Touch Targets**: Entire book card is clickable
2. **Visual Hierarchy**: Clear numbering and styling
3. **Color Coding**: Category badges, price in green
4. **Screen Reader Support**: Proper ARIA labels
5. **Keyboard Navigation**: Focus visible on cards

---

## Cart Functionality (Basic)

**localStorage Structure:**
```json
[
  {
    "id": 1,
    "name": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "price": 1000,
    "quantity": 1,
    "category": "Literature",
    "publication": "Scribner"
  }
]
```

**View Cart (Placeholder):**
- Say: **"View cart"**
- Expected: Reads cart items (implementation pending)

---

## Known Limitations

1. Cart checkout not yet implemented (Phase 4)
2. Book images not read (visual only)
3. No wake word detection yet (hook prepared)
4. No price range filtering
5. No sorting options (newest, cheapest)

---

## Success Criteria

- Browse all 20 books via voice navigation
- Filter by any category successfully
- Search finds correct books
- Item details read completely
- Add to cart works
- Visual list updates match voice state
- Pagination works in all contexts
- Error messages are clear and helpful

---

## Common Issues & Solutions

**Issue:** Numbers not recognized
- **Solution:** Say "item number three" instead of just "three"

**Issue:** Category not found
- **Solution:** Use standard categories: fiction, fantasy, thriller, biography, etc.

**Issue:** Search returns too many results
- **Solution:** Be more specific, or filter by category first

**Issue:** Voice cuts off during book list
- **Solution:** System chunks responses automatically, say "next" to continue

**Issue:** Can't find book added to cart
- **Solution:** Open browser console, check localStorage key "voice-cart"

---

## Next Steps (Phase 4)

- View cart functionality
- Checkout flow with voice
- Payment integration
- Order confirmation
- Order history viewing
- Wake word detection
- Persistent listening sessions
