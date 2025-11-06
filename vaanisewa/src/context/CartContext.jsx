import { createContext, useState, useEffect, useContext, useCallback } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'vaanisewa_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          if (parsed.items && Array.isArray(parsed.items)) {
            setItems(parsed.items);
          }
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    };

    loadCartFromStorage();
  }, []);

  useEffect(() => {
    const saveCartToStorage = () => {
      try {
        const cartData = {
          items,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    };

    saveCartToStorage();
  }, [items]);

  const addItem = useCallback((book, quantity = 1) => {
    if (!book || !book.id) {
      throw new Error('Invalid book object');
    }

    if (quantity < 1 || quantity > 10) {
      throw new Error('Quantity must be between 1 and 10');
    }

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item._id === book.id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      }

      return [
        ...prevItems,
        {
          _id: book.id,
          name: book.name,
          price: book.price,
          quantity,
          image: book.image || '',
          author: book.author || '',
          category: book.category || '',
        },
      ];
    });

    return true;
  }, []);

  const removeItem = useCallback((bookId) => {
    setItems((prevItems) => prevItems.filter((item) => item._id !== bookId));
    return true;
  }, []);

  const updateQuantity = useCallback((bookId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) {
      throw new Error('Quantity must be between 1 and 10');
    }

    setItems((prevItems) => {
      return prevItems.map((item) => {
        if (item._id === bookId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });

    return true;
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    return true;
  }, []);

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }, [items]);

  const getCartSummary = useCallback(() => {
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    const total = getCartTotal();

    return {
      itemCount,
      total,
      items,
    };
  }, [items, getCartTotal]);

  const getItemById = useCallback(
    (bookId) => {
      return items.find((item) => item._id === bookId);
    },
    [items]
  );

  const value = {
    items,
    total: getCartTotal(),
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartSummary,
    getItemById,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
