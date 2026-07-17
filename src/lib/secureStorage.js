/**
 * Secure Storage Manager
 * Handles sensitive data storage with security best practices
 * 
 * Rules:
 * - NO PII in localStorage (names, addresses, phone numbers)
 * - NO payment card details anywhere
 * - sessionStorage only for temporary cart before login
 * - All delivery/measurement data stored server-side only
 * - Tokens handled via HTTP-only cookies (backend sets them)
 */

const STORAGE_KEYS = {
  // Auth - moved to HTTP-only cookies (no longer stored client-side)
  // Keep these only for reference/debugging
  TOKEN_KEY: 'livn_token', // DEPRECATED - use cookies instead
  REFRESH_TOKEN_KEY: 'livn_refresh_token', // DEPRECATED
  AUTH_STATE_KEY: 'livn_auth_state', // DEPRECATED

  // Temporary client-side storage only
  TEMP_CART_KEY: 'livn_cart_temp', // Only before login, cleared on auth
  WISHLIST_KEY: 'livn_wishlist_ids', // Just product IDs, not full data
};

/**
 * ✅ SAFE: Store only product IDs in wishlist
 * - No PII
 * - Server stores full wishlist data
 */
export const saveWishlistLocally = (productIds) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.WISHLIST_KEY, JSON.stringify(productIds));
  } catch (e) {
    console.warn('Could not save wishlist:', e);
  }
};

export const getWishlistLocally = () => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * ✅ SAFE: Store temporary cart before login
 * - Uses sessionStorage (clears when tab closes)
 * - Product IDs and quantities only, no PII
 * - Server stores full cart data after login
 */
export const saveTempCart = (items) => {
  try {
    // Only store minimal data: productId, quantity, size
    const minimalItems = items.map(item => ({
      productId: item.productId || item.product?.id,
      quantity: item.quantity || item.qty,
      size: item.size || 'Standard',
    }));
    sessionStorage.setItem(STORAGE_KEYS.TEMP_CART_KEY, JSON.stringify(minimalItems));
  } catch (e) {
    console.warn('Could not save temporary cart:', e);
  }
};

export const getTempCart = () => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.TEMP_CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const clearTempCart = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.TEMP_CART_KEY);
  } catch (e) {
    console.warn('Could not clear temporary cart:', e);
  }
};

/**
 * ❌ NEVER STORE THESE:
 * - Delivery address (name, phone, house number, street, city, pincode, state)
 * - Body measurements
 * - Card details (number, expiry, CVV)
 * - Passwords
 * - API keys
 * - PII of any kind
 * 
 * These are stored on the backend only
 */

/**
 * ⚠️ DEPRECATED: These were storing PII and should NOT be used
 * Kept for reference only
 */
export const DEPRECATED_clearAllPII = () => {
  const piiKeys = [
    'livn_delivery', // Had address + phone
    'livn_wa_prefs', // Had phone number
    'bespokeMeasurements', // Had body measurements
    'bespokeFabric',
    'bespokeDesign',
    'bespokeConsultation',
    'quoteRequests', // Had address info
  ];

  piiKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn(`Could not remove key ${key}:`, e);
    }
  });

  console.log('✅ Cleared deprecated PII storage keys');
};

/**
 * Clear all sensitive local storage on logout
 */
export const clearAllStorage = () => {
  // Clear deprecated keys containing PII
  DEPRECATED_clearAllPII();
  
  // Clear temporary cart
  clearTempCart();
  
  // Clear auth tokens (should be removed by logout endpoint)
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEYS.AUTH_STATE_KEY);
    sessionStorage.clear();
  } catch (e) {
    console.warn('Could not clear storage:', e);
  }

  console.log('✅ All storage cleared on logout');
};

export default {
  saveWishlistLocally,
  getWishlistLocally,
  saveTempCart,
  getTempCart,
  clearTempCart,
  clearAllStorage,
};
