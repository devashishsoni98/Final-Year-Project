// import { Mic, BookOpen, LogIn } from "lucide-react";

// const HomeScreen = ({ user }) => {
//   return (
//     <div className="text-center py-10 space-y-6">
//       <Mic size={60} className="mx-auto text-blue-600" />

//       <h2 className="text-2xl font-bold text-slate-800">
//         {user ? `Welcome back, ${user.fullname}` : "Welcome to Vaani Sewa"}
//       </h2>

//       <p className="text-slate-500">
//         Speak naturally. I will handle everything for you.
//       </p>

//       <div className="grid grid-cols-1 gap-3 mt-6 text-sm">
//         <div className="bg-blue-50 p-3 rounded-lg">📚 Say "browse books"</div>
//         {!user && (
//           <div className="bg-emerald-50 p-3 rounded-lg">
//             🔐 Say "login" or "sign up"
//           </div>
//         )}
//         <div className="bg-purple-50 p-3 rounded-lg">🛒 Say "view cart"</div>
//       </div>
//     </div>
//   );
// };

// export default HomeScreen;





































// import { Mic, BookOpen, LogIn, ShoppingCart } from "lucide-react";

// const HomeScreen = ({ user }) => {
//   return (
//     <div
//       className="
//         h-full w-full
//         flex flex-col
//         items-center justify-center
//         text-center
//         gap-8
//         font-mono
//       "
//     >
//       {/* ===== Icon ===== */}
//       <div className="p-6 rounded-full bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-xl">
//         <Mic size={70} className="text-cyan-400 drop-shadow-lg" />
//       </div>

//       {/* ===== Title ===== */}
//       <div className="space-y-3">
//         <h2 className="text-3xl font-bold text-cyan-200">
//           {user ? `Welcome back, ${user.fullname}` : "Welcome to Vaani Sewa"}
//         </h2>

//         <p className="text-cyan-400/70 text-sm">
//           Speak naturally. I will handle everything for you.
//         </p>
//       </div>

//       {/* ===== Commands Grid ===== */}
//       <div
//         className="
//           grid grid-cols-1 md:grid-cols-3
//           gap-4
//           w-full max-w-2xl
//           mt-4
//         "
//       >
//         {/* Browse */}
//         <CommandCard
//           icon={<BookOpen size={20} />}
//           text='Say "browse books"'
//           color="cyan"
//         />

//         {/* Auth */}
//         {!user && (
//           <CommandCard
//             icon={<LogIn size={20} />}
//             text='Say "login" or "sign up"'
//             color="emerald"
//           />
//         )}

//         {/* Cart */}
//         <CommandCard
//           icon={<ShoppingCart size={20} />}
//           text='Say "view cart"'
//           color="purple"
//         />
//       </div>
//     </div>
//   );
// };

// /* ================= Command Card ================= */
// const CommandCard = ({ icon, text, color }) => {
//   const colors = {
//     cyan: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200",
//     emerald: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
//     purple: "border-purple-400/40 bg-purple-500/10 text-purple-200",
//   };

//   return (
//     <div
//       className={`
//         flex items-center justify-center gap-2
//         p-4 rounded-xl
//         border backdrop-blur-lg
//         transition hover:scale-105 hover:shadow-lg
//         ${colors[color]}
//       `}
//     >
//       {icon}
//       <span className="text-sm">{text}</span>
//     </div>
//   );
// };

// export default HomeScreen;





import { Mic, BookOpen, LogIn, ShoppingCart } from "lucide-react";

const HomeScreen = ({ user }) => {
  return (
    <div
      className="
        h-full w-full
        flex flex-col
        items-center justify-center
        text-center
        gap-10
        px-6
      "
    >
      {/* ===== Hero Icon ===== */}
      <div className="p-6 rounded-full bg-blue-100 border border-blue-200 shadow-sm">
        <Mic size={64} className="text-blue-600" />
      </div>

      {/* ===== Title ===== */}
      <div className="space-y-2 max-w-xl">
        <h2 className="text-3xl font-bold text-slate-800">
          {user ? `Welcome back, ${user.fullname}` : "Welcome to Vaani Sewa"}
        </h2>

        <p className="text-slate-500 text-sm">
          Speak naturally. I will handle everything for you.
        </p>
      </div>

      {/* ===== Commands ===== */}
      <div
        className="
          grid
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
          gap-4
          w-full max-w-3xl
        "
      >
        <CommandCard
          icon={<BookOpen size={20} />}
          text='Say "browse books"'
        />

        {!user && (
          <CommandCard
            icon={<LogIn size={20} />}
            text='Say "login" or "sign up"'
          />
        )}

        <CommandCard
          icon={<ShoppingCart size={20} />}
          text='Say "view cart"'
        />
      </div>
    </div>
  );
};


/* ================= Command Card ================= */
const CommandCard = ({ icon, text }) => {
  return (
    <div
      className="
        flex items-center justify-center gap-2
        p-4
        bg-white
        border border-slate-200
        rounded-xl
        shadow-sm
        text-slate-700
        text-sm font-medium
        transition
        hover:bg-slate-50
        hover:shadow-md
      "
    >
      <span className="text-blue-600">{icon}</span>
      {text}
    </div>
  );
};

export default HomeScreen;
