import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Ruler, Truck, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotifications } from './NotificationSystem';
import './QuickViewModal.css';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { showSuccess } = useNotifications();

  useEffect(() => {
    if (isOpen && product) {
      document.body.style.overflow = 'hidden';
      setSelectedSize(product.sizes?.[0] || '');
      
      // Check if product is in wishlist
      try {
        const wishlist = JSON.parse(localStorage.getItem('livn_wishlist') || '[]');
        setIsWishlisted(wishlist.includes(String(product.id || product._id)));
      } catch {
        setIsWishlisted(false);
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product]);

  const toggleWishlist = () => {
    if (!product) return;
    
    try {
      const wishlist = JSON.parse(localStorage.getItem('livn_wishlist') || '[]');
      const productId = String(product.id || product._id);
      
      if (isWishlisted) {
        const updated = wishlist.filter(id => id !== productId);
        localStorage.setItem('livn_wishlist', JSON.stringify(updated));
        setIsWishlisted(false);
        showSuccess('Removed from wishlist');
      } else {
        wishlist.push(productId);
        localStorage.setItem('livn_wishlist', JSON.stringify(wishlist));
        setIsWishlisted(true);
        showSuccess('Added to wishlist');
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      showError('Please select a size');
      return;
    }

    const cartItem = {
      ...product,
      selected_size: selectedSize,
      quantity: quantity
    };

    addToCart(cartItem);
    showSuccess(`Added ${product.name} to cart`);
    onClose();
  };

  if (!isOpen || !product) return null;

  const price = product.offer_price || product.price;
  const originalPrice = product.price;
  const hasDiscount = product.offer_price && product.offer_price < product.price;
  const discount = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="quick-view-overlay" onClick={onClose}>
      <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="quick-view-close" onClick={onClose} aria-label="Close quick view">
          <X size={24} />
        </button>

        <div className="quick-view-content">
          {/* Product Image */}
          <div className="quick-view-image">
            <img src={product.image} alt={product.name} />
            {hasDiscount && (
              <div className="quick-view-discount-badge">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="quick-view-details">
            <div className="quick-view-header">
              <h2 className="quick-view-title">{product.name}</h2>
              <button 
                className={`quick-view-wishlist ${isWishlisted ? 'wishlisted' : ''}`}
                onClick={toggleWishlist}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="quick-view-category">{product.category}</div>

            <div className="quick-view-pricing">
              <span className="quick-view-price">₹{price?.toLocaleString('en-IN')}</span>
              {hasDiscount && (
                <span className="quick-view-original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
              )}
            </div>

            {product.description && (
              <p className="quick-view-description">{product.description}</p>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="quick-view-sizes">
                <label className="quick-view-label">
                  <Ruler size={16} />
                  Size
                </label>
                <div className="size-options">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="quick-view-quantity">
              <label className="quick-view-label">Quantity</label>
              <div className="quantity-selector">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="quick-view-actions">
              <button 
                className="btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={!selectedSize}
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>
            </div>

            {/* Features */}
            <div className="quick-view-features">
              <div className="feature-item">
                <Truck size={16} />
                <span>Free Delivery</span>
              </div>
              <div className="feature-item">
                <Shield size={16} />
                <span>7 Days Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;