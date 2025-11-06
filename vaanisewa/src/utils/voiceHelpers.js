export function extractNumber(text) {
  const normalized = text.toLowerCase().trim();

  const numberWords = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
    'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
    'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
    'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5,
    'sixth': 6, 'seventh': 7, 'eighth': 8, 'ninth': 9, 'tenth': 10,
  };

  for (const [word, num] of Object.entries(numberWords)) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized)) {
      return num;
    }
  }

  const digitMatch = normalized.match(/\b(\d+)\b/);
  if (digitMatch) {
    return parseInt(digitMatch[1], 10);
  }

  const itemMatch = normalized.match(/\b(?:item|number)\s+(?:number\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i);
  if (itemMatch) {
    const value = itemMatch[1];
    return numberWords[value] || parseInt(value, 10);
  }

  return null;
}

export function extractSearchQuery(text) {
  const patterns = [
    /(?:search|find|look)\s+(?:for|about)\s+(.+)/i,
    /(?:show|list|get)\s+books?\s+(?:about|on|related to)\s+(.+)/i,
    /(?:books?\s+about|books?\s+on)\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

export function extractCategory(text) {
  const patterns = [
    /(?:show|list|display|get|browse)\s+(?:me\s+)?(\w+)\s+books?/i,
    /(?:show|list)\s+(?:the\s+)?(\w+)\s+category/i,
    /(?:category|genre)\s+(\w+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

export function isPaginationCommand(text) {
  const normalized = text.toLowerCase().trim();

  if (/\b(next|more|continue|forward)\b/.test(normalized)) {
    return 'next';
  }

  if (/\b(previous|back|before|prior)\b/.test(normalized)) {
    return 'previous';
  }

  if (/\bfirst\s+page\b/.test(normalized)) {
    return 'first';
  }

  if (/\blast\s+page\b/.test(normalized)) {
    return 'last';
  }

  const pageMatch = normalized.match(/\b(?:page|go to page)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i);
  if (pageMatch) {
    return { page: extractNumber(pageMatch[0]) };
  }

  return null;
}

export function isDetailsCommand(text) {
  const normalized = text.toLowerCase().trim();

  const patterns = [
    /\b(?:read|tell me|show|get)\s+(?:details|info|information)\s+(?:for|about|of)\s+(?:item|book|number)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i,
    /\b(?:tell me|read)\s+about\s+(?:item|book|number)?\s*(\d+|one|two|three|four|five)/i,
    /\b(?:item|book|number)\s*(\d+|one|two|three|four|five)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const number = extractNumber(match[0]);
      if (number !== null) {
        return number;
      }
    }
  }

  return null;
}

export function formatPrice(price) {
  if (typeof price !== 'number') return 'price not available';

  if (price >= 1000) {
    return `${Math.floor(price / 100)} hundred rupees`;
  }

  return `${price} rupees`;
}

export function generateBookAnnouncement(book, index) {
  return `Item ${index}: ${book.name} by ${book.author}, ${formatPrice(book.price)}.`;
}

export function generateBookDetails(book) {
  const parts = [
    `${book.name} by ${book.author}.`,
    book.publication ? `Published by ${book.publication}.` : null,
    book.category ? `Category: ${book.category}.` : null,
    book.price ? `Price: ${formatPrice(book.price)}.` : null,
    book.title ? book.title : null,
  ];

  return parts.filter(Boolean).join(' ');
}

export function generatePaginationSummary(paginationInfo) {
  const { startIndex, endIndex, totalBooks, currentPage, totalPages } = paginationInfo;

  if (totalBooks === 0) {
    return 'No books found.';
  }

  if (totalBooks === 1) {
    return 'Showing 1 book.';
  }

  return `Showing items ${startIndex} through ${endIndex} of ${totalBooks} results. Page ${currentPage} of ${totalPages}.`;
}
