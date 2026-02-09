import {
  isDetailsCommand,
  generateBookDetails,
  formatPrice,
} from "../utils/voiceHelpers";
import commandParser from "../dialogue/CommandParser";
import { getBookDetailsUrl, getStoreUrl } from "../utils/iframeNavigation";

let _storeListCache = null;
const getStoreList = async () => {
  if (_storeListCache) return _storeListCache;
  try {
    const base = getStoreUrl().replace(/\/$/, "");
    const res = await fetch(`${base}/list.json`);
    if (!res.ok) return [];
    const json = await res.json();
    _storeListCache = json;
    return json;
  } catch (e) {
    console.warn("Failed to fetch store list.json:", e);
    return [];
  }
};

const resolveStoreBookId = async (book) => {
  if (!book) return null;

  // If book.id is already a finite positive number (e.g., from list.json or backend),
  // use it directly as the preferred id. This avoids returning MongoDB ObjectIds.
  if (book?.id != null) {
    const coerced = Number(book.id);
    if (Number.isFinite(coerced) && coerced > 0) {
      console.log(
        `Resolved book id for "${book.name}": ${coerced} (from book.id)`,
      );
      return coerced;
    }
  }

  // Fallback: try to match by name/title/author in list.json to get its numeric id
  const list = await getStoreList();
  if (!list || list.length === 0) return null;
  const name = (book?.name || book?.title || "")
    .toString()
    .trim()
    .toLowerCase();
  const author = (book?.author || "").toString().trim().toLowerCase();
  let match = list.find(
    (item) =>
      item.name &&
      item.name.toString().trim().toLowerCase() === name &&
      (!author ||
        (item.author || "").toString().trim().toLowerCase() === author),
  );
  if (!match && name) {
    match = list.find(
      (item) =>
        item.name && item.name.toString().trim().toLowerCase().includes(name),
    );
  }
  if (!match && book?.title) {
    const title = book.title.toString().trim().toLowerCase();
    match = list.find(
      (item) =>
        item.title &&
        item.title.toString().trim().toLowerCase().includes(title),
    );
  }
  if (match) {
    console.log(
      `Resolved book id for "${book.name}": ${match.id} (from list.json match)`,
    );
    return match.id;
  }

  console.warn(
    `Could not resolve book id for: "${book.name}", fallback to null`,
  );
  return null;
};

export const createProductDetailsFlow = (options) => {
  const { onAddToCartViaContext, onBackToList } = options || {};
  return async (userInput, flowState) => {
    const { step, paginationInfo, currentItemIndex, selectedBook } =
      flowState || {};
    switch (step) {
      case "init": {
        const itemNumber = isDetailsCommand(userInput);
        if (itemNumber === null || itemNumber < 1 || itemNumber > 5) {
          return {
            response: "Please say a number from 1 to 5 to hear book details.",
            flowState,
            requiresInput: true,
          };
        }
        if (!paginationInfo || !paginationInfo.books) {
          return {
            response:
              "No books available. Say browse books to see the catalog.",
            completed: true,
            requiresInput: false,
          };
        }
        const raw = paginationInfo.books[itemNumber - 1];
        const book = raw ? { ...raw } : null;
        if (!book)
          return {
            response: `Item ${itemNumber} is not available on this page.`,
            flowState,
            requiresInput: true,
          };
        const details = generateBookDetails(book);
        const storeId = await resolveStoreBookId(book);
        // Always prefer numeric id, fallback to _id only if it's a string (not ObjectId)
        let navId = storeId;
        if (!navId && book?.id != null) {
          const coerced = Number(book.id);
          if (Number.isFinite(coerced) && coerced > 0) {
            navId = coerced;
          }
        }
        if (!navId && book?._id && typeof book._id === "string") {
          navId = book._id;
        }
        console.log(
          `Product flow: book="${book.name}", storeId=${storeId}, navId=${navId}`,
          book,
        );
        return {
          response: `${details} Say add to cart to purchase, back to return to the list, or next item to hear the next book.`,
          flowState: {
            ...flowState,
            step: "details-shown",
            selectedBook: book,
            currentItemIndex: itemNumber,
          },
          iframeNavigation: getBookDetailsUrl(navId),
          requiresInput: true,
        };
      }
      case "details-shown": {
        const intent = commandParser.matchIntent(userInput);
        if (intent === "addToCart") {
          // if (onAddToCartViaContext) onAddToCartViaContext(selectedBook, 1);
          if (onAddToCartViaContext) {
            const storeId = await resolveStoreBookId(selectedBook);

            onAddToCartViaContext(
              {
                ...selectedBook,
                id: storeId || selectedBook.id || selectedBook._id,
              },
              1,
            );
          } else {
            const existingCart = JSON.parse(
              localStorage.getItem("vaanisewa_cart") || "[]",
            );
            localStorage.setItem(
              "vaanisewa_cart",
              JSON.stringify([
                ...existingCart,
                { ...selectedBook, quantity: 1 },
              ]),
            );
          }
          return {
            response: `${selectedBook.name} added to cart for ${formatPrice(
              selectedBook.price,
            )}.`,
            flowState,
            requiresInput: true,
          };
        }
        if (/\b(?:back|return|go back|list)\b/i.test(userInput)) {
          if (onBackToList) onBackToList();
          return {
            response: "Returning to book list.",
            completed: true,
            requiresInput: false,
            action: "back-to-list",
            iframeNavigation: getStoreUrl(),
          };
        }
        if (/\b(?:next|next item|next book)\b/i.test(userInput)) {
          const nextIndex = (currentItemIndex || 0) + 1;
          if (!paginationInfo?.books?.[nextIndex - 1])
            return {
              response: "No more items on this page.",
              flowState,
              requiresInput: true,
            };
          const nextBook = { ...paginationInfo.books[nextIndex - 1] };
          const details = generateBookDetails(nextBook);
          const storeIdNext = await resolveStoreBookId(nextBook);
          let navIdNext = storeIdNext;
          if (!navIdNext && nextBook?.id != null) {
            const coerced = Number(nextBook.id);
            if (Number.isFinite(coerced) && coerced > 0) {
              navIdNext = coerced;
            }
          }
          if (!navIdNext && nextBook?._id && typeof nextBook._id === "string") {
            navIdNext = nextBook._id;
          }
          return {
            response: `${details} Say add to cart, back, or next item.`,
            flowState: {
              ...flowState,
              selectedBook: nextBook,
              currentItemIndex: nextIndex,
            },
            iframeNavigation: getBookDetailsUrl(navIdNext),
            requiresInput: true,
          };
        }
        if (
          /\b(?:previous|previous item|previous book|last)\b/i.test(userInput)
        ) {
          const prevIndex = (currentItemIndex || 0) - 1;
          if (prevIndex < 1)
            return {
              response:
                "This is the first item. Say back to return to the list.",
              flowState,
              requiresInput: true,
            };
          const prevBook = { ...paginationInfo.books[prevIndex - 1] };
          const details = generateBookDetails(prevBook);
          const storeIdPrev = await resolveStoreBookId(prevBook);
          let navIdPrev = storeIdPrev;
          if (!navIdPrev && prevBook?.id != null) {
            const coerced = Number(prevBook.id);
            if (Number.isFinite(coerced) && coerced > 0) {
              navIdPrev = coerced;
            }
          }
          if (!navIdPrev && prevBook?._id && typeof prevBook._id === "string") {
            navIdPrev = prevBook._id;
          }
          return {
            response: `${details} Say add to cart, back, or previous item.`,
            flowState: {
              ...flowState,
              selectedBook: prevBook,
              currentItemIndex: prevIndex,
            },
            iframeNavigation: getBookDetailsUrl(navIdPrev),
            requiresInput: true,
          };
        }
        return {
          response:
            "Say add to cart to purchase this book, back to return to the list, or next item to hear another book.",
          flowState,
          requiresInput: true,
        };
      }
      default:
        return {
          response: "Something went wrong. Say browse books to start over.",
          completed: true,
          requiresInput: false,
        };
    }
  };
};

export default createProductDetailsFlow;
