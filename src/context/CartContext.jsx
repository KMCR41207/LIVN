import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

const CartContext = createContext(null);
const LOCAL_STORAGE_KEY = 'livn_cart_local'; // For temporary local cart before login
const API = import.meta.env.VITE_API_URL || '/api';

export const CartProvider = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartId, setCartId] = useState(null);

  // Fetch cart from database
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !accessToken) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API}/cart`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch cart');
      
      const result = await response.json();
      if (result.data) {
        setCartItems(result.data.items || []);
        setCartId(result.data._id);
      }
    } catch (err) {
      console.error('Fetch cart error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, accessToken]);

  // Fetch cart when authenticated or token changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load from local storage for unauthenticated users
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setCartItems(JSON.parse(saved));
        }
      } catch {
        setCartItems([]);
      }
    }
  }, [isAuthenticated, accessToken, fetchCart]);

  // Save to localStorage when cart changes (for unauthenticated users)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Add to cart
  const addToCart = useCallback(async (product, size = 'Standard') => {
    if (!isAuthenticated || !accessToken) {
      // For unauthenticated users, add to local state
      setCartItems(prev => {
        const existing = prev.findIndex(
          i => i.productId === product.id && i.size === size
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing].quantity += 1;
          return updated;
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            offerPrice: product.offer_price,
            quantity: 1,
            size,
            image: product.image,
            addedAt: new Date().toISOString(),
          },
        ];
      });
      return;
    }

    try {
      const response = await fetch(`${API}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          price: product.price,
          offerPrice: product.offer_price,
          quantity: 1,
          size,
          image: product.image,
        }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');

      const result = await response.json();
      if (result.data) {
        setCartItems(result.data.items || []);
        setCartId(result.data._id);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
    }
  }, [isAuthenticated, accessToken]);

  // Remove from cart
  const removeFromCart = useCallback(async (productId, size = 'Standard') => {
    if (!isAuthenticated || !accessToken) {
      setCartItems(prev =>
        prev.filter(i => !(i.productId === productId && i.size === size))
      );
      return;
    }

    try {
      // Find the item ID in current cart
      const item = cartItems.find(
        i => i.productId === productId && i.size === size
      );
      if (!item || !item._id) {
        console.warn('Item ID not found');
        return;
      }

      const response = await fetch(`${API}/cart/items/${item._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to remove from cart');

      const result = await response.json();
      if (result.data) {
        setCartItems(result.data.items || []);
      }
    } catch (err) {
      console.error('Remove from cart error:', err);
    }
  }, [isAuthenticated, accessToken, cartItems]);

  // Update quantity
  const updateQty = useCallback(async (productId, size = 'Standard', quantity) => {
    if (quantity < 1) {
      removeFromCart(productId, size);
      return;
    }

    if (!isAuthenticated || !accessToken) {
      setCartItems(prev =>
        prev.map(i =>
          i.productId === productId && i.size === size
            ? { ...i, quantity }
            : i
        )
      );
      return;
    }

    try {
      const item = cartItems.find(
        i => i.productId === productId && i.size === size
      );
      if (!item || !item._id) {
        console.warn('Item ID not found');
        return;
      }

      const response = await fetch(`${API}/cart/items/${item._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) throw new Error('Failed to update quantity');

      const result = await response.json();
      if (result.data) {
        setCartItems(result.data.items || []);
      }
    } catch (err) {
      console.error('Update quantity error:', err);
    }
  }, [isAuthenticated, accessToken, cartItems, removeFromCart]);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setCartItems([]);
      return;
    }

    try {
      const response = await fetch(`${API}/cart`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to clear cart');

      const result = await response.json();
      if (result.data) {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  }, [isAuthenticated, accessToken]);

  // Convert cart items to format expected by Checkout
  // Each cartItem from DB has productId, name, price, offerPrice, quantity, size, image
  // We need to return items in format: { product: { id, name, price, offer_price, image, ... }, size, qty }
  const formattedCartItems = cartItems.map(item => ({
    product: {
      id: item.productId,
      name: item.name,
      price: item.price,
      offer_price: item.offerPrice,
      image: item.image,
      category: item.category || 'Uncategorized', // May need to fetch from product
    },
    size: item.size,
    qty: item.quantity,
    _id: item._id, // Keep the MongoDB ID for API calls
  }));

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + (i.offerPrice || i.price) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems: formattedCartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
        refetchCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
