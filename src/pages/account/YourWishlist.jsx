import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { PRODUCTS } from '../../data/products';
import './AccountPages.css';

const getWishlistIds = () => {
  try { return JSON.parse(localStorage.getItem('livn_wishlist') || '[]'); }
  catch { return []; }
};

const YourWishlist = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [wishlistIds, setWishlistIds] = useState(getWishlistIds);
  const [apiProducts, setApiProducts] = useState([]);

  // Fetch any DB products that might be wishlisted
  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || '/api';
    fetch(`${API}/products`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.data) setApiProducts(data.data); })
      .catch(() => {});
  }, []);

  // All products combined
  const allProducts = [...apiProducts, ...PRODUCTS];

  // Get wishlisted product objects
  const wishlistProducts = wishlistIds
    .map(id => allProducts.find(p => String(p._id || p.id) === String(id)))
    .filter(Boolean);

  const removeFromWishlist = (productId) => {
    const updated = wishlistIds.filter(id => id !== String(productId));
    localStorage.setItem('livn_wishlist', JSON.stringify(updated));
    setWishlistIds(updated);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 'Standard');
  };

  if (wishlistProducts.length === 0) {
    return (
      <div className="account-page">
        <h2 className="account-section-title">Your Wishlist</h2>
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🤍</div>
          <h3>Wishlist is Empty</h3>
          <p>Save items you love by clicking the ♡ heart icon on any product. They'll be waiting for you here.</p>
          <button className="btn-primary" onClick={() => navigate('/collections')}>
            <ShoppingBag size={16} /> Browse Collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <h2 className="account-section-title">Your Wishlist ({wishlistProducts.length})</h2>
      <div className="wishlist-grid">
        {wishlistProducts.map(product => {
          const id = String(product._id || product.id);
          const hasDiscount = product.offer_price && product.offer_price < product.price;
          const discountPct = hasDiscount
            ? Math.round(((product.price - product.offer_price) / product.price) * 100)
            : 0;
          return (
            <div key={id} className="wishlist-card">
              <div className="wishlist-img-wrap" onClick={() => navigate(`/product/${id}`)}>
                <img src={product.image} alt={product.name} className="wishlist-img" />
                {hasDiscount && <span className="wishlist-discount-badge">{discountPct}% OFF</span>}
              </div>
              <div className="wishlist-info">
                <h4 className="wishlist-name" onClick={() => navigate(`/product/${id}`)}>{product.name}</h4>
                <p className="wishlist-category">{product.category}</p>
                <div className="wishlist-price-row">
                  {hasDiscount ? (
                    <>
                      <span className="wishlist-offer">₹{product.offer_price.toLocaleString('en-IN')}</span>
                      <span className="wishlist-mrp">₹{product.price.toLocaleString('en-IN')}</span>
                    </>
                  ) : (
                    <span className="wishlist-price">₹{(product.price || 0).toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="wishlist-actions">
                  <button className="wishlist-cart-btn" onClick={() => handleAddToCart(product)}>
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                  <button className="wishlist-remove-btn" onClick={() => removeFromWishlist(id)} title="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YourWishlist;
