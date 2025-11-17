import {
  fetchBooks,
  filterBooksByCategory,
  searchBooks,
  paginateBooks,
  mapCategoryFromVoice,
} from "../services/bookService";
import {
  extractSearchQuery,
  extractCategory,
  isPaginationCommand,
  generateBookAnnouncement,
  generatePaginationSummary,
} from "../utils/voiceHelpers";
import { getStoreUrl } from "../utils/iframeNavigation";

export const createBrowseFlow = (onComplete) => {
  return async (userInput, flowState) => {
    const {
      step,
      allBooks,
      filteredBooks,
      currentPage,
      perPage = 5,
      category,
      searchQuery,
    } = flowState;

    switch (step) {
      case "init": {
        const result = await fetchBooks();

        if (!result.success || result.books.length === 0) {
          return {
            response:
              "Sorry, I could not load books at this time. Please try again later.",
            completed: true,
            requiresInput: false,
          };
        }

        const paginationInfo = paginateBooks(result.books, 1, perPage);
        paginationInfo.books = paginationInfo.books.map((b) => ({
          ...b,
          id: parseInt(b.id),
        }));

        const summary = generatePaginationSummary(paginationInfo);
        const bookList = paginationInfo.books
          .map((book, idx) => generateBookAnnouncement(book, idx + 1))
          .join(" ");

        const navigationHint = paginationInfo.hasNext
          ? " Say next for more, or a number to hear details."
          : " Say a number to hear details, or search to find specific books.";

        return {
          response: `${summary} ${bookList}${navigationHint}`,
          flowState: {
            ...flowState,
            step: "browsing",
            allBooks: result.books,
            filteredBooks: result.books,
            currentPage: 1,
            paginationInfo,
          },
          iframeNavigation: getStoreUrl(),
          requiresInput: true,
        };
      }

      case "browsing": {
        const searchQueryInput = extractSearchQuery(userInput);
        if (searchQueryInput) {
          const results = searchBooks(allBooks, searchQueryInput);

          if (results.length === 0) {
            return {
              response: `No results found for "${searchQueryInput}". Try different keywords, or say browse all to see all books.`,
              flowState: { ...flowState, step: "browsing" },
              requiresInput: true,
            };
          }

          const paginationInfo = paginateBooks(results, 1, perPage);
          paginationInfo.books = paginationInfo.books.map((b) => ({
            ...b,
            id: parseInt(b.id),
          }));

          const summary = generatePaginationSummary(paginationInfo);
          const bookList = paginationInfo.books
            .map((book, idx) => generateBookAnnouncement(book, idx + 1))
            .join(" ");

          return {
            response: `${summary} ${bookList} Say next for more, or a number for details.`,
            flowState: {
              ...flowState,
              step: "browsing",
              filteredBooks: results,
              currentPage: 1,
              paginationInfo,
              searchQuery: searchQueryInput,
              category: null,
            },
            requiresInput: true,
          };
        }

        const categoryInput = extractCategory(userInput);
        if (categoryInput) {
          const mappedCategory = mapCategoryFromVoice(categoryInput);

          if (!mappedCategory) {
            return {
              response: `I couldn't find category "${categoryInput}". Try fiction, fantasy, thriller, biography, or say browse all for everything.`,
              flowState,
              requiresInput: true,
            };
          }

          const results = filterBooksByCategory(allBooks, mappedCategory);

          if (results.length === 0) {
            return {
              response: `No books found in ${mappedCategory} category. Say browse all to see all books.`,
              flowState,
              requiresInput: true,
            };
          }

          const paginationInfo = paginateBooks(results, 1, perPage);
          paginationInfo.books = paginationInfo.books.map((b) => ({
            ...b,
            id: parseInt(b.id),
          }));

          const summary = generatePaginationSummary(paginationInfo);
          const bookList = paginationInfo.books
            .map((book, idx) => generateBookAnnouncement(book, idx + 1))
            .join(" ");

          return {
            response: `Showing ${mappedCategory} books. ${summary} ${bookList} Say next for more, or a number for details.`,
            flowState: {
              ...flowState,
              filteredBooks: results,
              currentPage: 1,
              paginationInfo,
              category: mappedCategory,
              searchQuery: null,
            },
            requiresInput: true,
          };
        }

        const paginationCmd = isPaginationCommand(userInput);
        if (paginationCmd) {
          let newPage = currentPage;

          if (paginationCmd === "next" && flowState.paginationInfo.hasNext) {
            newPage = currentPage + 1;
          } else if (
            paginationCmd === "previous" &&
            flowState.paginationInfo.hasPrevious
          ) {
            newPage = currentPage - 1;
          } else if (paginationCmd === "first") {
            newPage = 1;
          } else if (paginationCmd === "last") {
            newPage = flowState.paginationInfo.totalPages;
          } else if (typeof paginationCmd === "object" && paginationCmd.page) {
            const requestedPage = paginationCmd.page;
            if (
              requestedPage >= 1 &&
              requestedPage <= flowState.paginationInfo.totalPages
            ) {
              newPage = requestedPage;
            } else {
              return {
                response: `Page ${requestedPage} does not exist. There are ${flowState.paginationInfo.totalPages} pages total.`,
                flowState,
                requiresInput: true,
              };
            }
          } else {
            return {
              response:
                paginationCmd === "next"
                  ? "You are on the last page. Say previous to go back."
                  : "You are on the first page. Say next for more.",
              flowState,
              requiresInput: true,
            };
          }

          const paginationInfo = paginateBooks(filteredBooks, newPage, perPage);
          paginationInfo.books = paginationInfo.books.map((b) => ({
            ...b,
            id: parseInt(b.id),
          }));

          const summary = generatePaginationSummary(paginationInfo);
          const bookList = paginationInfo.books
            .map((book, idx) =>
              generateBookAnnouncement(book, paginationInfo.startIndex + idx)
            )
            .join(" ");

          return {
            response: `${summary} ${bookList} Say next or previous for navigation, or a number for details.`,
            flowState: {
              ...flowState,
              currentPage: newPage,
              paginationInfo,
            },
            requiresInput: true,
          };
        }

        if (/\b(?:browse|show)\s+all\b/i.test(userInput)) {
          const paginationInfo = paginateBooks(allBooks, 1, perPage);
          paginationInfo.books = paginationInfo.books.map((b) => ({
            ...b,
            id: parseInt(b.id),
          }));

          const summary = generatePaginationSummary(paginationInfo);
          const bookList = paginationInfo.books
            .map((book, idx) => generateBookAnnouncement(book, idx + 1))
            .join(" ");

          return {
            response: `Showing all books. ${summary} ${bookList} Say next for more.`,
            flowState: {
              ...flowState,
              filteredBooks: allBooks,
              currentPage: 1,
              paginationInfo,
              category: null,
              searchQuery: null,
            },
            requiresInput: true,
          };
        }

        return {
          response:
            "Say search to find books, a category name to filter, next or previous for navigation, or a number to hear book details.",
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
