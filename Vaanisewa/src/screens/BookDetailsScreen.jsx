// const BookDetailsScreen = ({ book }) => {
//   if (!book) {
//     return (
//       <div className="p-10 text-center text-gray-500">
//         Select a book to see details
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col md:flex-row gap-8 items-center">

//       {/* Cover */}
//       <img
//         src={book.image}
//         alt={book.name}
//         className="w-56 h-80 object-cover rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
//       />

//       {/* Details */}
//       <div className="flex-1 space-y-3">
//         <h2 className="text-2xl font-bold text-slate-800">{book.name}</h2>

//         <p className="text-slate-600 italic">
//           by {book.author}
//         </p>

//         <p className="text-lg font-semibold text-emerald-600">
//           ₹ {book.price}
//         </p>

//         <p className="text-sm text-slate-500">
//           Category: {book.category}
//         </p>

//         <p className="text-slate-700 leading-relaxed">
//           {book.title}
//         </p>

//         <div className="pt-4 text-sm text-blue-600">
//           🎤 Say "add to cart", "next", or "back"
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookDetailsScreen;


const BookDetailsScreen = ({ book }) => {
  if (!book) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Select a book to see details
      </div>
    );
  }

  return (
    <div
      className="
        h-full w-full
        grid grid-cols-1 lg:grid-cols-5
        gap-12
        items-start
      "
    >
      {/* ================= COVER ================= */}
      <div className="lg:col-span-2 flex justify-center">
        <img
          src={book.image}
          alt={book.name}
          className="
            w-72 h-[420px]
            object-cover
            rounded-xl
            border border-slate-200
            shadow-md
          "
        />
      </div>

      {/* ================= DETAILS ================= */}
      <div className="lg:col-span-3 flex flex-col space-y-5 w-full">

        {/* Title */}
        <h2 className="text-4xl font-bold text-slate-900 leading-tight">
          {book.name}
        </h2>

        {/* Author */}
        <p className="text-slate-500 italic text-base">
          by {book.author}
        </p>

        {/* Price */}
        <p className="text-2xl font-semibold text-emerald-600">
          ₹ {book.price}
        </p>

        {/* Category */}
        <p className="text-sm text-slate-400">
          Category: {book.category}
        </p>

        {/* Description */}
        <p className="text-slate-600 leading-relaxed max-w-3xl text-base">
          {book.title}
        </p>

        {/* Voice Hint (FULL WIDTH BAR) */}
        <div
          className="
            mt-6
            w-full
            bg-blue-50
            border border-blue-200
            rounded-lg
            px-5 py-4
            text-blue-700
            text-sm
          "
        >
          🎤 Say <b>"add to cart"</b>, <b>"next"</b>, or <b>"back"</b>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsScreen;
