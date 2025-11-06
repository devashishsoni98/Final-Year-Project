import { isDetailsCommand, generateBookDetails, formatPrice } from '../utils/voiceHelpers';
import commandParser from '../dialogue/CommandParser';

export const createProductDetailsFlow = (onAddToCart, onBackToList) => {
  return async (userInput, flowState) => {
    const { step, paginationInfo, currentItemIndex, selectedBook } = flowState;

    switch (step) {
      case 'init': {
        const itemNumber = isDetailsCommand(userInput);

        if (itemNumber === null || itemNumber < 1 || itemNumber > 5) {
          return {
            response: 'Please say a number from 1 to 5 to hear book details.',
            flowState,
            requiresInput: true,
          };
        }

        if (!paginationInfo || !paginationInfo.books) {
          return {
            response: 'No books available. Say browse books to see the catalog.',
            completed: true,
            requiresInput: false,
          };
        }

        const book = paginationInfo.books[itemNumber - 1];

        if (!book) {
          return {
            response: `Item ${itemNumber} is not available on this page. Say a number from 1 to ${paginationInfo.books.length}.`,
            flowState,
            requiresInput: true,
          };
        }

        const details = generateBookDetails(book);

        return {
          response: `${details} Say add to cart to purchase, back to return to the list, or next item to hear the next book.`,
          flowState: {
            ...flowState,
            step: 'details-shown',
            selectedBook: book,
            currentItemIndex: itemNumber,
          },
          requiresInput: true,
        };
      }

      case 'details-shown': {
        const intent = commandParser.matchIntent(userInput);

        if (intent === 'addToCart') {
          if (onAddToCart) {
            onAddToCart(selectedBook);
          }

          const existingCart = JSON.parse(localStorage.getItem('voice-cart') || '[]');
          const updatedCart = [...existingCart, { ...selectedBook, quantity: 1 }];
          localStorage.setItem('voice-cart', JSON.stringify(updatedCart));

          return {
            response: `${selectedBook.name} added to cart for ${formatPrice(selectedBook.price)}. Say view cart to checkout, or back to continue browsing.`,
            flowState,
            requiresInput: true,
          };
        }

        if (/\b(?:back|return|go back|list)\b/i.test(userInput)) {
          if (onBackToList) {
            onBackToList();
          }
          return {
            response: 'Returning to book list.',
            completed: true,
            requiresInput: false,
            action: 'back-to-list',
          };
        }

        if (/\b(?:next|next item|next book)\b/i.test(userInput)) {
          const nextIndex = currentItemIndex + 1;

          if (!paginationInfo.books[nextIndex - 1]) {
            return {
              response: 'No more items on this page. Say back to return to the list, or next page for more books.',
              flowState,
              requiresInput: true,
            };
          }

          const nextBook = paginationInfo.books[nextIndex - 1];
          const details = generateBookDetails(nextBook);

          return {
            response: `${details} Say add to cart, back, or next item.`,
            flowState: {
              ...flowState,
              selectedBook: nextBook,
              currentItemIndex: nextIndex,
            },
            requiresInput: true,
          };
        }

        if (/\b(?:previous|previous item|previous book|last)\b/i.test(userInput)) {
          const prevIndex = currentItemIndex - 1;

          if (prevIndex < 1) {
            return {
              response: 'This is the first item. Say back to return to the list.',
              flowState,
              requiresInput: true,
            };
          }

          const prevBook = paginationInfo.books[prevIndex - 1];
          const details = generateBookDetails(prevBook);

          return {
            response: `${details} Say add to cart, back, or previous item.`,
            flowState: {
              ...flowState,
              selectedBook: prevBook,
              currentItemIndex: prevIndex,
            },
            requiresInput: true,
          };
        }

        return {
          response: 'Say add to cart to purchase this book, back to return to the list, or next item to hear another book.',
          flowState,
          requiresInput: true,
        };
      }

      default:
        return {
          response: 'Something went wrong. Say browse books to start over.',
          completed: true,
          requiresInput: false,
        };
    }
  };
};
