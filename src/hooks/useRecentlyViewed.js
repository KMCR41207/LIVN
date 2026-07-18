/**
 * useRecentlyViewed
 * Tracks products the user has viewed, stored in localStorage.
 * Max 20 items, newest first.
 */

const STORAGE_KEY = 'livn_recently_viewed';
const MAX_ITEMS = 20;

export function saveRecentlyViewed(product) {
  try {
    if (!product) return;
    const existing = getRecentlyViewed();

    // Normalise the product to a lean object
    const item = {
      id: product._id || product.id,
      name: product.name,
      price: product.offer_price || product.price,
      originalPrice: product.price,
      image: product.image,
      category: product.category,
      viewedAt: Date.now(),
    };

    if (!item.id || !item.name) return;

    // Remove duplicate (same id)
    const filtered = existing.filter(p => p.id !== item.id);

    // Prepend and cap
    const updated = [item, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
