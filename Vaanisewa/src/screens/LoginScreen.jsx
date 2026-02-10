// const LoginScreen = () => {
//   return (
//     <div className="flex flex-col items-center justify-center text-center py-12 space-y-6">

//       <div className="text-6xl">🔐</div>

//       <h2 className="text-2xl font-bold text-slate-800">
//         Login to Your Account
//       </h2>

//       <p className="text-slate-500 max-w-md">
//         Please say your email address, then your password.
//       </p>

//       <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-3 text-sm text-blue-700">
//         🎤 Listening for your voice...
//       </div>
//     </div>
//   );
// };

// export default LoginScreen;

import { Mic, Lock, ShieldCheck } from "lucide-react";

const LoginScreen = () => {
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
      <div className="p-6 rounded-full bg-blue-50 border border-blue-200">
        <Lock size={64} className="text-blue-600" />
      </div>

      {/* ===== Title ===== */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">
          Login to Your Account
        </h2>

        <p className="text-slate-500 text-sm max-w-md">
          Use your voice to sign in securely
        </p>
      </div>

      {/* ===== Instructions Card ===== */}
      <div
        className="
          w-full max-w-md
          bg-white
          border border-slate-200
          rounded-2xl
          shadow-sm
          p-6
          space-y-4
        "
      >
        <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium">
          <ShieldCheck size={18} />
          Secure Voice Authentication
        </div>

        <div className="text-slate-600 text-sm space-y-1">
          <p>1️⃣ Say your email address</p>
          <p>2️⃣ Then say your password</p>
        </div>

        <div className="text-xs text-slate-400">
          Speak clearly and naturally
        </div>
      </div>

      {/* ===== Listening Indicator ===== */}
      <div
        className="
          w-full max-w-md
          bg-blue-50
          border border-blue-200
          rounded-xl
          px-6 py-4
          text-blue-700
          text-sm
          shadow-sm
          flex items-center justify-center gap-2
        "
      >
        <Mic size={16} />
        Listening for your voice...
      </div>
    </div>
  );
};

export default LoginScreen;
