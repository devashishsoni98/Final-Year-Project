import api from "./api";

// export async function fetchBooks(filters = {}) {
//   try {
//     const response = await api.get('/book', { params: filters });
//     return {
//       success: true,
//       books: response.data || [],
//       error: null,
//     };
//   } catch (error) {
//     return {
//       success: false,
//       books: [],
//       error: error.response?.data?.message || 'Failed to fetch books',
//     };
//   }
// }

export async function fetchBooks(filters = {}) {
  try {
    const response = await api.get("/book", { params: filters });
    const booksData = response.data || [];

    // Fetch list.json to get canonical numeric ids
    let listJson = [];
    try {
      const listRes = await fetch("http://localhost:5174/list.json");
      if (listRes.ok) {
        listJson = await listRes.json();
      }
    } catch (e) {
      console.warn("Failed to fetch list.json:", e);
    }

    // Map backend books to include numeric id from list.json
    const mappedBooks = booksData.map((book) => {
      let numericId = null;

      // Try to find matching book in list.json by name or title
      if (listJson.length > 0) {
        const name = (book.name || book.title || "")
          .toString()
          .trim()
          .toLowerCase();
        const author = (book.author || "").toString().trim().toLowerCase();

        // Exact match by name + author
        let match = listJson.find(
          (item) =>
            item.name &&
            item.name.toString().trim().toLowerCase() === name &&
            (!author ||
              (item.author || "").toString().trim().toLowerCase() === author)
        );

        // Partial match by name
        if (!match && name) {
          match = listJson.find(
            (item) =>
              item.name &&
              item.name.toString().trim().toLowerCase().includes(name)
          );
        }

        // Partial match by title
        if (!match && book.title) {
          const title = book.title.toString().trim().toLowerCase();
          match = listJson.find(
            (item) =>
              item.title &&
              item.title.toString().trim().toLowerCase().includes(title)
          );
        }

        if (match) {
          numericId = match.id;
        }
      }

      // Fallback: try to parse book.id if it's numeric, otherwise use MongoDB _id
      if (!numericId) {
        if (book.id) {
          const coerced = Number(book.id);
          if (Number.isFinite(coerced) && coerced > 0) {
            numericId = coerced;
          }
        }
      }

      return {
        ...book,
        id: numericId || book._id, // Use matched id, or fallback to MongoDB _id
      };
    });

    return {
      success: true,
      books: mappedBooks,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      books: [],
      error: error.response?.data?.message || "Failed to fetch books",
    };
  }
}

export function filterBooksByCategory(books, category) {
  if (!category) return books;
  const categoryLower = category.toLowerCase();
  return books.filter(
    (book) => book.category && book.category.toLowerCase() === categoryLower
  );
}

export function searchBooks(books, query) {
  if (!query) return books;
  const queryLower = query.toLowerCase();

  return books.filter((book) => {
    const nameMatch = book.name?.toLowerCase().includes(queryLower);
    const authorMatch = book.author?.toLowerCase().includes(queryLower);
    const titleMatch = book.title?.toLowerCase().includes(queryLower);
    const categoryMatch = book.category?.toLowerCase().includes(queryLower);

    return nameMatch || authorMatch || titleMatch || categoryMatch;
  });
}

export function paginateBooks(books, page = 1, perPage = 5) {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedBooks = books.slice(startIndex, endIndex);

  return {
    books: paginatedBooks,
    totalBooks: books.length,
    currentPage: page,
    totalPages: Math.ceil(books.length / perPage),
    hasNext: endIndex < books.length,
    hasPrevious: page > 1,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, books.length),
  };
}

export function getBookById(books, id) {
  return books.find((book) => book.id === parseInt(id));
}

export const CATEGORIES = [
  "Literature",
  "Fiction",
  "Classic",
  "Fantasy",
  "Philosophy",
  "Biography",
  "Education",
  "Thriller",
  "Mystery",
  "Teenage",
  "Adventure",
  "Law",
];

export const CATEGORY_SYNONYMS = {
  fiction: "Fiction",
  novels: "Fiction",
  story: "Fiction",
  stories: "Fiction",
  fantasy: "Fantasy",
  magic: "Fantasy",
  thriller: "Thriller",
  thrillers: "Thriller",
  suspense: "Thriller",
  mystery: "Mystery",
  mysteries: "Mystery",
  detective: "Mystery",
  biography: "Biography",
  biographies: "Biography",
  memoir: "Biography",
  memoirs: "Biography",
  literature: "Literature",
  classic: "Classic",
  classics: "Classic",
  philosophy: "Philosophy",
  philosophical: "Philosophy",
  teen: "Teenage",
  teenage: "Teenage",
  "young adult": "Teenage",
  ya: "Teenage",
  adventure: "Adventure",
  adventures: "Adventure",
  education: "Education",
  educational: "Education",
  law: "Law",
  legal: "Law",
};

export function mapCategoryFromVoice(voiceCategory) {
  if (!voiceCategory) return null;
  const normalized = voiceCategory.toLowerCase().trim();
  return CATEGORY_SYNONYMS[normalized] || null;
}
