import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'livn_cart';

export const CartProvider = ({ children }) => {
  // Initialise from localStorage so cart survives page refreshes
  const [cartItem, setCartItem] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Keep localStorage in sync whenever cartItem changes
  useEffect(() => {
    if (cartItem) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItem));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [cartItem]);

  const addToCart = (product, size) => {
    setCartItem({ product, size: size || 'Standard' });
  };

  const clearCart = () => setCartItem(null);

  return (
    <CartContext.Provider value={{ cartItem, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
