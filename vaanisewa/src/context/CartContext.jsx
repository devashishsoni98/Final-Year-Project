// import {
//   createContext,
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
// } from "react";

// const CartContext = createContext();

// const CART_STORAGE_KEY = "vaanisewa_cart";

// export const CartProvider = ({ children }) => {
//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     localStorage.removeItem(CART_STORAGE_KEY);
//   }, []);

//   useEffect(() => {
//     const loadCartFromStorage = () => {
//       try {
//         const storedCart = localStorage.getItem(CART_STORAGE_KEY);
//         if (storedCart) {
//           const parsed = JSON.parse(storedCart);
//           if (parsed.items && Array.isArray(parsed.items)) {
//             setItems(parsed.items);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to load cart from localStorage:", error);
//       }
//     };

//     loadCartFromStorage();
//   }, []);

//   useEffect(() => {
//     const saveCartToStorage = () => {
//       try {
//         const cartData = {
//           items,
//           lastUpdated: new Date().toISOString(),
//         };
//         localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
//       } catch (error) {
//         console.error("Failed to save cart to localStorage:", error);
//       }
//     };

//     saveCartToStorage();
//   }, [items]);

//   const addItem = useCallback((book, quantity = 1) => {
//     if (!book) {
//       throw new Error("Invalid book object");
//     }

//     // Use book.id (numeric id from list.json) as the unique identifier
//     const bookId = book.id || book._id;
//     if (!bookId) {
//       throw new Error("Book must have an id or _id field");
//     }

//     if (quantity < 1 || quantity > 10) {
//       throw new Error("Quantity must be between 1 and 10");
//     }

//     setItems((prevItems) => {
//       const existingItemIndex = prevItems.findIndex(
//         (item) => item.id === bookId,
//       );

//       if (existingItemIndex >= 0) {
//         const updatedItems = [...prevItems];
//         if (existingItemIndex >= 0) {
//           const updatedItems = [...prevItems];

//           updatedItems[existingItemIndex] = {
//             ...updatedItems[existingItemIndex],
//             quantity: updatedItems[existingItemIndex].quantity + quantity,
//           };

//           return updatedItems;
//         }

//         return updatedItems;
//       }

//       return [
//         ...prevItems,
//         {
//           id: bookId,
//           _id: book._id || bookId, // Keep MongoDB _id if available for reference
//           name: book.name,
//           price: book.price,
//           quantity,
//           image: book.image || "",
//           author: book.author || "",
//           category: book.category || "",
//         },
//       ];
//     });

//     return true;
//   }, []);

//   const removeItem = useCallback((bookId) => {
//     setItems((prevItems) => prevItems.filter((item) => item.id !== bookId));
//     return true;
//   }, []);

//   const updateQuantity = useCallback((bookId, newQuantity) => {
//     if (newQuantity < 1 || newQuantity > 10) {
//       throw new Error("Quantity must be between 1 and 10");
//     }

//     setItems((prevItems) => {
//       return prevItems.map((item) => {
//         if (item.id === bookId) {
//           return { ...item, quantity: newQuantity };
//         }
//         return item;
//       });
//     });

//     return true;
//   }, []);

//   const clearCart = useCallback(() => {
//     setItems([]);
//     return true;
//   }, []);

//   const getCartTotal = useCallback(() => {
//     return items.reduce((total, item) => {
//       return total + item.price * item.quantity;
//     }, 0);
//   }, [items]);

//   const getCartSummary = useCallback(() => {
//     const itemCount = items.reduce((count, item) => count + item.quantity, 0);
//     const total = getCartTotal();

//     return {
//       itemCount,
//       total,
//       items,
//     };
//   }, [items, getCartTotal]);

//   const getItemById = useCallback(
//     (bookId) => {
//       return items.find((item) => item.id === bookId);
//     },
//     [items],
//   );

//   const value = {
//     items,
//     total: getCartTotal(),
//     itemCount: items.reduce((count, item) => count + item.quantity, 0),
//     addItem,
//     removeItem,
//     updateQuantity,
//     clearCart,
//     getCartTotal,
//     getCartSummary,
//     getItemById,
//   };

//   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// };

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error("useCart must be used within CartProvider");
//   }
//   return context;
// };

import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
const CartContext = createContext();

// const CART_STORAGE_KEY = "vaanisewa_cart";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const { user } = useAuth();

  const getStorageKey = () => {
    if (user && user._id) {
      return `vaanisewa_cart_${user._id}`;
    }
    return "vaanisewa_cart_guest";
  };

  /* ===============================
     Load cart from localStorage
  =============================== */
  // useEffect(() => {
  //   try {
  //     const stored = localStorage.getItem(CART_STORAGE_KEY);
  //     if (stored) {
  //       const parsed = JSON.parse(stored);
  //       if (Array.isArray(parsed)) {
  //         setItems(parsed);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Failed loading cart:", err);
  //   }
  // }, []);

  useEffect(() => {
    try {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed loading cart:", err);
    }
  }, [user]); // 🔥 important

  /* ===============================
     Save cart whenever items change
  =============================== */
  // useEffect(() => {
  //   try {
  //     localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  //   } catch (err) {
  //     console.error("Failed saving cart:", err);
  //   }
  // }, [items]);

  useEffect(() => {
    try {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(items));
    } catch (err) {
      console.error("Failed saving cart:", err);
    }
  }, [items, user]);

  /* ===============================
     Add item (merge quantity)
  =============================== */

  const addItem = useCallback((book, quantity = 1) => {
    if (!book) return;

    // ALWAYS create safe unique id
    const bookId = book._id || book.id || `${book.name}-${book.author}`; // ← fallback unique key

    setItems((prev) => {
      const existing = prev.find((item) => item.id === bookId);

      if (existing) {
        return prev.map((item) =>
          item.id === bookId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: bookId,
          name: book.name,
          price: book.price,
          image: book.image || "",
          author: book.author || "",
          quantity,
        },
      ];
    });
  }, []);

  /* ===============================
     Remove item
  =============================== */
  const removeItem = useCallback((bookId) => {
    setItems((prev) => prev.filter((item) => item.id !== bookId));
  }, []);

  /* ===============================
     Update quantity
  =============================== */
  const updateQuantity = useCallback((bookId, qty) => {
    if (qty < 1) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === bookId ? { ...item, quantity: qty } : item,
      ),
    );
  }, []);

  /* ===============================
     Clear cart
  =============================== */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /* ===============================
     Helpers
  =============================== */
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const getItemById = useCallback(
    (id) => items.find((item) => item.id === id),
    [items],
  );

  const getCartSummary = useCallback(() => {
    return {
      items,
      total,
      itemCount,
    };
  }, [items, total, itemCount]);

  const value = {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemById,
    getCartSummary,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
