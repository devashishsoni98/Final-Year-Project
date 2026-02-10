// import { useAuth } from "../context/AuthContext";
// import { useOrders } from "../context/OrdersContext";

// const OrdersScreen = () => {
//   const { user } = useAuth();
//   const { getOrders } = useOrders();

//   const orders = user ? getOrders(user._id) : [];

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold">Your Orders</h2>

//       {orders.length === 0 && <p>No orders yet.</p>}

//       {orders.map((order) => (
//         <div key={order.id} className="border rounded-lg p-4">
//           <p>Total: ₹{order.total}</p>
//           <p>Date: {new Date(order.date).toLocaleString()}</p>
//           <p>Items: {order.items.length}</p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default OrdersScreen;


import { Package, CalendarDays, ReceiptText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrdersContext";

const OrdersScreen = () => {
  const { user } = useAuth();
  const { getOrders } = useOrders();

  const orders = user ? getOrders(user._id) : [];

  return (
    <div
      className="
        h-full w-full
        flex flex-col
        min-h-0
      "
    >
      {/* ===== Header ===== */}
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
          <Package size={22} className="text-indigo-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Your Orders
          </h2>
          <p className="text-sm text-slate-500">
            Track your past purchases
          </p>
        </div>
      </div>

      {/* ===== Empty State ===== */}
      {orders.length === 0 ? (
        <div
          className="
            flex-1
            flex flex-col
            items-center justify-center
            text-center
            text-slate-400
            gap-3
          "
        >
          <ReceiptText size={48} />
          <p className="text-sm">No orders yet</p>
        </div>
      ) : (
        /* ===== Scrollable List ===== */
        <div
          className="
            flex-1 min-h-0
            overflow-y-auto
            space-y-4
            pr-1
          "
        >
          {orders.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};


/* ================= Order Card ================= */

const OrderCard = ({ order, index }) => {
  return (
    <div
      className="
        bg-white
        border border-slate-200
        rounded-xl
        shadow-sm
        p-5
        flex flex-col md:flex-row
        md:items-center md:justify-between
        gap-3
      "
    >
      {/* Left Info */}
      <div className="space-y-1">
        <p className="text-sm text-slate-500">
          Order #{index + 1}
        </p>

        <p className="text-lg font-semibold text-slate-800">
          ₹ {order.total}
        </p>

        <p className="text-xs text-slate-400">
          {order.items.length} items
        </p>
      </div>

      {/* Right Info */}
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <CalendarDays size={14} />
        {new Date(order.date).toLocaleString()}
      </div>
    </div>
  );
};

export default OrdersScreen;
