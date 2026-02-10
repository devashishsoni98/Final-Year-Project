// const SignupScreen = () => {
//   return (
//     <div className="flex flex-col items-center justify-center text-center py-12 space-y-6">

//       <div className="text-6xl">📝</div>

//       <h2 className="text-2xl font-bold text-slate-800">
//         Create Your Account
//       </h2>

//       <p className="text-slate-500 max-w-md">
//         Please say your full name, email address, and password to register.
//       </p>

//       <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-3 text-sm text-emerald-700">
//         🎤 Listening for your voice...
//       </div>
//     </div>
//   );
// };

// export default SignupScreen;

import { UserPlus, Mic } from "lucide-react";

const SignupScreen = () => {
  return (
    <div
      className="
        h-full w-full
        flex flex-col
        items-center justify-center
        text-center
        gap-8
        px-6
      "
    >
      {/* ===== Icon Block ===== */}
      <div
        className="
          p-6
          rounded-2xl
          bg-emerald-50
          border border-emerald-200
          shadow-sm
        "
      >
        <UserPlus size={56} className="text-emerald-600" />
      </div>

      {/* ===== Title Section ===== */}
      <div className="space-y-3 max-w-md">
        <h2 className="text-3xl font-bold text-slate-800">
          Create Your Account
        </h2>

        <p className="text-slate-500 text-sm leading-relaxed">
          Please say your full name, email address, and password to register.
        </p>
      </div>

      {/* ===== Listening Indicator ===== */}
      <div
        className="
          flex items-center gap-2
          bg-emerald-50
          border border-emerald-200
          text-emerald-700
          px-6 py-3
          rounded-lg
          text-sm
          font-medium
          shadow-sm
        "
      >
        <Mic size={16} />
        Listening for your voice...
      </div>
    </div>
  );
};

export default SignupScreen;
