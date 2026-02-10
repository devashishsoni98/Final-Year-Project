// import { ShoppingCart } from "lucide-react";
// import { useCart } from "../context/CartContext";

// const CartScreen = () => {
//   const { itemCount, total } = useCart();

//   return (
//     <div className="text-center py-8 space-y-4">
//       <ShoppingCart size={48} className="mx-auto text-green-600" />

//       <h2 className="text-xl font-semibold">Your Cart</h2>

//       {itemCount === 0 ? (
//         <p className="text-slate-500">Cart is empty</p>
//       ) : (
//         <>
//           <p className="text-slate-600">{itemCount} items</p>
//           <p className="font-bold text-lg">₹ {total}</p>
//         </>
//       )}
//     </div>
//   );
// };

// export default CartScreen;


import { ShoppingCart, Mic } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartScreen = () => {
  const { itemCount, total } = useCart();

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
      <div className="p-6 rounded-full bg-emerald-50 border border-emerald-200">
        <ShoppingCart size={64} className="text-emerald-600" />
      </div>

      {/* ===== Title ===== */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">
          Your Cart
        </h2>

        <p className="text-slate-500 text-sm">
          Review your items before checkout
        </p>
      </div>

      {/* ===== Summary Card ===== */}
      <div
        className="
          w-full max-w-md
          bg-white
          border border-slate-200
          rounded-2xl
          shadow-sm
          p-6
          space-y-3
        "
      >
        {itemCount === 0 ? (
          <p className="text-slate-500 text-sm">
            Your cart is empty
          </p>
        ) : (
          <>
            <div className="flex justify-between text-slate-600 text-sm">
              <span>Items</span>
              <span className="font-medium">{itemCount}</span>
            </div>

            <div className="flex justify-between text-lg font-semibold text-slate-800">
              <span>Total</span>
              <span>₹ {total}</span>
            </div>
          </>
        )}
      </div>

      {/* ===== Voice Instruction Box ===== */}
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

        {itemCount === 0 ? (
          <p>Say <b>"browse books"</b> to continue shopping</p>
        ) : (
          <p>
            Say <b>"checkout"</b>, <b>"remove item"</b>, or <b>"browse books"</b>
          </p>
        )}
      </div>
    </div>
  );
};

export default CartScreen;
