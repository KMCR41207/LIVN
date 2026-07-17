import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'livn_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Migrate: old format was a single object {product, size}, new format is an array
      if (!Array.isArray(parsed)) {
        // If it looks like the old single-item format, migrate it
        if (parsed && parsed.product) {
          return [{ product: parsed.product, size: parsed.size || 'Standard', qty: 1 }];
        }
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item — if same product+size already in cart, increment qty
  const addToCart = (product, size) => {
    const s = size || 'Standard';
    setCartItems(prev => {
      const existing = prev.findIndex(i => i.product.id === product.id && i.size === s);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], qty: updated[existing].qty + 1 };
        return updated;
      }
      return [...prev, { product, size: s, qty: 1 }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prev => prev.filter(i => !(i.product.id === productId && i.size === size)));
  };

  const updateQty = (productId, size, qty) => {
    if (qty < 1) { removeFromCart(productId, size); return; }
    setCartItems(prev => prev.map(i =>
      i.product.id === productId && i.size === size ? { ...i, qty } : i
    ));
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cartItems.reduce((sum, i) => sum + (i.product.offer_price || i.product.price) * i.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
