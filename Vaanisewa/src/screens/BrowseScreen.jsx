// import { BookOpen } from "lucide-react";

// const BrowseScreen = () => {
//   return (
//     <div className="text-center py-8">
//       <BookOpen size={48} className="mx-auto text-indigo-600 mb-4" />

//       <h2 className="text-xl font-semibold text-slate-800">
//         Browsing Books
//       </h2>

//       <p className="text-slate-500 text-sm mt-2">
//         Say item number to hear details
//       </p>
//     </div>
//   );
// };

// export default BrowseScreen;

import { BookOpen, Mic } from "lucide-react";

const BrowseScreen = () => {
  return (
    <div
      className="
        h-full w-full
        flex flex-col
        items-center justify-center
        text-center
        gap-8
      "
    >
      {/* ===== Icon ===== */}
      <div className="p-6 rounded-full bg-indigo-50 border border-indigo-200">
        <BookOpen size={64} className="text-indigo-600" />
      </div>

      {/* ===== Title ===== */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">
          Browsing Books
        </h2>

        <p className="text-slate-500 text-sm">
          I’m listening for your commands
        </p>
      </div>

      {/* ===== Voice Instructions Card ===== */}
      <div
        className="
          w-full max-w-xl
          bg-blue-50
          border border-blue-200
          rounded-xl
          px-6 py-5
          text-blue-700
          text-sm
          shadow-sm
        "
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mic size={16} />
          <span className="font-semibold">Voice Commands</span>
        </div>

        <p>
          Say <b>"number one"</b>, <b>"next"</b>, or <b>"back"</b> to navigate
        </p>
      </div>
    </div>
  );
};

export default BrowseScreen;
