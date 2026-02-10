// import { CreditCard } from "lucide-react";

// const CheckoutScreen = () => {
//   return (
//     <div className="text-center py-10 space-y-4">
//       <CreditCard size={48} className="mx-auto text-purple-600" />

//       <h2 className="text-xl font-semibold">Checkout</h2>

//       <p className="text-slate-500">
//         Processing your order securely
//       </p>
//     </div>
//   );
// };

// export default CheckoutScreen;


import { CreditCard, ShieldCheck, Mic } from "lucide-react";

const CheckoutScreen = () => {
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
        <CreditCard size={64} className="text-indigo-600" />
      </div>

      {/* ===== Title ===== */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">
          Checkout
        </h2>

        <p className="text-slate-500 text-sm">
          Processing your order securely
        </p>
      </div>

      {/* ===== Secure Payment Card ===== */}
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
        <div className="flex items-center justify-center gap-2 text-emerald-600">
          <ShieldCheck size={18} />
          <span className="text-sm font-medium">
            Secure Payment Gateway
          </span>
        </div>

        <p className="text-slate-600 text-sm">
          Your payment will be processed safely using encrypted checkout.
        </p>

        <div className="text-xs text-slate-400">
          Please wait while we connect to the payment provider...
        </div>
      </div>

      {/* ===== Voice Instructions ===== */}
      <div
        className="
          w-full max-w-xl
          bg-blue-50
          border border-blue-200
          rounded-xl
          px-6 py-4
          text-blue-700
          text-sm
          shadow-sm
        "
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Mic size={16} />
          <span className="font-semibold">Voice Commands</span>
        </div>

        <p>
          Say <b>"confirm payment"</b> or <b>"cancel"</b> to go back
        </p>
      </div>
    </div>
  );
};

export default CheckoutScreen;
