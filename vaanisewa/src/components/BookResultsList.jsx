import { useState, useEffect } from 'react';

const BookResultsList = ({ books, currentPage, onBookSelect, currentlyReading }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !books || books.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="text-center text-slate-400">
          <p>No books to display</p>
          <p className="text-sm mt-2">Use voice commands to browse books</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
      role="list"
      aria-label="Book results"
    >
      <div className="mb-4 pb-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Available Books</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Page {currentPage} - Say a number for details
        </p>
      </div>

      <div className="space-y-2.5">
        {books.map((book, index) => (
          <button
            key={book.id}
            onClick={() => onBookSelect && onBookSelect(index + 1)}
            className={`w-full p-4 rounded-lg border-l-4 text-left transition-all duration-200 ${
              currentlyReading === index + 1
                ? 'bg-blue-50 border-blue-500 shadow-sm'
                : 'bg-slate-50 border-slate-300 hover:bg-slate-100 hover:border-blue-400'
            }`}
            aria-label={`Book ${index + 1}: ${book.name} by ${book.author}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600 font-bold text-base">
                    {index + 1}
                  </span>
                  <h3 className="text-slate-800 font-semibold text-base">
                    {book.name}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm mb-2">
                  by {book.author}
                </p>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                    {book.category}
                  </span>
                  <span className="text-emerald-600 font-semibold text-sm">
                    ₹{book.price}
                  </span>
                </div>
              </div>
              {currentlyReading === index + 1 && (
                <div className="ml-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-500 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-600 text-center">
          Say a number (1-{books.length}) to hear details
        </p>
      </div>
    </div>
  );
};

export default BookResultsList;
