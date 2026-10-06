import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTempCart, saveTempCart, clearTempCart } from '../lib/secureStorage';

const CartContext = createContext(null);
const API = import.meta.env.VITE_API_URL || '/api';

const CartProvider = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartId, setCartId] = useState(null);

  // Fetch cart from database
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      console.log('⏭️ Skipping fetchCart: not authenticated');
      return;
    }
    
    console.log('🔄 Fetching cart from API...');
    setIsLoading(true);
    try {
      const response = await fetch(`${API}/cart`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!response.ok) {
        console.error('❌ Fetch cart failed:', response.status);
        throw new Error('Failed to fetch cart');
      }
      
      const result = await response.json();
      console.log('✅ Cart fetched:', result);
      
      if (result.data) {
        setCartItems(result.data.items || []);
        setCartId(result.data._id);
        console.log('✅ Cart state updated:', result.data.items?.length || 0, 'items');
      }
    } catch (err) {
      console.error('❌ Fetch cart error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, accessToken]);

  // Fetch cart when authenticated or token changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load temporary cart from sessionStorage for unauthenticated users
      // sessionStorage clears when tab is closed (more secure than localStorage)
      try {
        const saved = getTempCart();
        if (saved && Array.isArray(saved)) {
          setCartItems(saved);
        }
      } catch {
        setCartItems([]);
      }
    }
  }, [isAuthenticated, accessToken, fetchCart]);

  // Save to sessionStorage when cart changes (for unauthenticated users)
  useEffect(() => {
    if (!isAuthenticated) {
      saveTempCart(cartItems);
    }
  }, [cartItems, isAuthenticated]);

  // Add to cart
  const addToCart = useCallback(async (product, size = 'Standard') => {
    console.log('🛒 Add to cart called:', { product, size, isAuthenticated });
    
    if (!isAuthenticated || !accessToken) {
      // For unauthenticated users, add to local state
      console.log('📦 Adding to local cart (not authenticated)');
      setCartItems(prev => {
        const pid = String(product._id || product.id);
        const existing = prev.findIndex(
          i => String(i.productId) === pid && i.size === size
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing].quantity += 1;
          console.log('✅ Updated quantity for existing item');
          return updated;
        }
        const newItem = {
          productId: pid,
          name: product.name || 'Product',
          price: Number(product.price) || 0,
          offerPrice: product.offer_price != null ? Number(product.offer_price) : null,
          quantity: 1,
          size,
          image: product.image || product.images?.[0] || '',
          addedAt: new Date().toISOString(),
        };
        console.log('✅ Added new item to cart:', newItem);
        return [...prev, newItem];
      });
      return;
    }

    try {
      console.log('🌐 Sending to backend API...');
      const payload = {
        productId: String(product._id || product.id),
        name: product.name || 'Product',
        price: Number(product.price) || 0,
        offerPrice: product.offer_price != null ? Number(product.offer_price) : null,
        quantity: 1,
        size,
        image: product.image || product.images?.[0] || '',
      };
      console.log('📤 Payload:', payload);
      
      const response = await fetch(`${API}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error('Failed to add to cart');
      }

      const result = await response.json();
      console.log('✅ API Response:', result);
      
      if (result.data) {
        setCartItems(result.data.items || []);
        setCartId(result.data._id);
        console.log('✅ Cart updated with', result.data.items?.length || 0, 'items');
      }
      // Refetch to ensure we have the latest state
      await fetchCart();
    } catch (err) {
      console.error('❌ Add to cart error:', err);
      alert('Failed to add to cart: ' + err.message);
    }
  }, [isAuthenticated, accessToken, fetchCart]);

  // Remove from cart
  const removeFromCart = useCallback(async (productId, size = 'Standard') => {
    if (!isAuthenticated || !accessToken) {
      setCartItems(prev =>
        prev.filter(i => !(String(i.productId) === String(productId) && i.size === size))
      );
      return;
    }

    try {
      const item = cartItems.find(i =>
        String(i.productId) === String(productId) && i.size === size
      );
      
      if (!item || !item._id) {
        console.warn('Item ID not found for removal', { productId, size });
        await fetchCart();
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
  }, [isAuthenticated, accessToken, cartItems, fetchCart]);

  // Update quantity
  const updateQty = useCallback(async (productId, size = 'Standard', quantity) => {
    if (quantity < 1) {
      removeFromCart(productId, size);
      return;
    }

    if (!isAuthenticated || !accessToken) {
      setCartItems(prev =>
        prev.map(i =>
          String(i.productId) === String(productId) && i.size === size
            ? { ...i, quantity }
            : i
        )
      );
      return;
    }

    try {
      const item = cartItems.find(i =>
        String(i.productId) === String(productId) && i.size === size
      );
      
      if (!item || !item._id) {
        console.warn('Item ID not found for update', { productId, size });
        await fetchCart();
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
  }, [isAuthenticated, accessToken, cartItems, removeFromCart, fetchCart]);

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
  // We need to return items in format: { product: { id, name, price, offer_price, image, ... }, size, qty, _id }
  const formattedCartItems = cartItems
    .filter(item => item && item.productId) // skip malformed/stale items
    .map(item => {
      const price = Number(item.price) || 0;
      const offerPrice = item.offerPrice != null ? Number(item.offerPrice) : null;
      // productId is now always stored as a string
      const productId = String(item.productId || '');
      return {
        product: {
          id: productId,
          _id: productId, // Add _id for consistency
          name: item.name || 'Product',
          price,
          offer_price: offerPrice,
          image: item.image || '',
          category: item.category || 'Uncategorized',
        },
        size: item.size || 'Standard',
        qty: Number(item.quantity) || 1,
        _id: item._id, // Keep the MongoDB cart item ID for API calls
      };
    });

  console.log('🎨 Formatted cart items:', formattedCartItems);

  const totalItems = cartItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const totalPrice = cartItems.reduce((sum, i) => {
    const price = Number(i.offerPrice) || Number(i.price) || 0;
    const qty = Number(i.quantity) || 0;
    return sum + price * qty;
  }, 0);

  console.log('📊 Cart stats:', { totalItems, totalPrice, rawItemsCount: cartItems.length });

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

function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export { CartProvider, useCart };
