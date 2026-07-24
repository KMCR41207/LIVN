import './ProductCard.css';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import './ProductCard.css';

const getWishlist = () => {
  try { return JSON.parse(localStorage.getItem('livn_wishlist') || '[]'); }
  catch { return []; }
};

const ProductCard = ({ product, onClick }) => {
  const hasDiscount = product.offer_price && product.offer_price < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.offer_price) / product.price) * 100)
    : 0;

  const productId = String(product._id || product.id);
  const [wishlisted, setWishlisted] = useState(() => getWishlist().includes(productId));

  useEffect(() => {
    setWishlisted(getWishlist().includes(productId));
  }, [productId]);

  const toggleWishlist = (e) => {
    e.stopPropagation();
    const current = getWishlist();
    const updated = wishlisted
      ? current.filter(id => id !== productId)
      : [...current, productId];
    localStorage.setItem('livn_wishlist', JSON.stringify(updated));
    setWishlisted(!wishlisted);
  };

  return (
    <div
      className="product-card"
      onClick={() => onClick && onClick(product)}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}, ₹${(product.offer_price || product.price || 0).toLocaleString('en-IN')}`}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick && onClick(product)}
    >
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={e => { e.target.src = '/images/placeholder.jpg'; }}
        />
        {hasDiscount && (
          <span className="product-discount-badge">{discountPct}% OFF</span>
        )}
        <button
          className={`product-wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={toggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={wishlisted ? '#fff' : 'none'} />
        </button>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <div className="product-price-row">
          {hasDiscount ? (
            <>
              <span className="product-offer-price">₹{product.offer_price.toLocaleString('en-IN')}</span>
              <span className="product-mrp">₹{product.price.toLocaleString('en-IN')}</span>
            </>
          ) : (
            <span className="product-price">₹{(product.price || 0).toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
