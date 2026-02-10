import { createContext, useContext, useState, useEffect } from "react";

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [ordersMap, setOrdersMap] = useState({});

  /* =========================
     LOAD once from localStorage
  ========================= */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("vaanisewa_orders") || "{}");
    setOrdersMap(stored);
  }, []);

  /* =========================
     AUTO SAVE whenever state changes
  ========================= */
  useEffect(() => {
    localStorage.setItem("vaanisewa_orders", JSON.stringify(ordersMap));
  }, [ordersMap]);

  /* =========================
     GET
  ========================= */
  const getOrders = (userId) => {
    return ordersMap[userId] || [];
  };

  /* =========================
     ADD  ⭐ REACTIVE NOW
  ========================= */
  const addOrder = (userId, order) => {
    setOrdersMap((prev) => ({
      ...prev,
      [userId]: [...(prev[userId] || []), order],
    }));
  };

  return (
    <OrdersContext.Provider value={{ getOrders, addOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);
