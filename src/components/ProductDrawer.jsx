import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductDrawer.css';

const ProductDrawer = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Close on ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, selectedSize || 'Standard');
    onClose();
    // Brief toast feedback would be nice, for now just close
  };

  const handleOrderNow = () => {
    addToCart(product, selectedSize || 'Standard');
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <button className="drawer-close" onClick={onClose}><X size={22} /></button>

        <div className="drawer-image-container">
          <img src={product.image} alt={product.name} className="drawer-image" />
        </div>

        <div className="drawer-content">
          <p className="product-meta">{product.category} Collection</p>
          <h2 className="product-name">{product.name}</h2>
          <div className="product-price-large">₹{product.price.toLocaleString('en-IN')}</div>

          <div className="product-divider"><div className="carving-icon">✦</div></div>

          <p className="product-description">{product.description}</p>

          <div className="product-features">
            <h4 className="features-title">Garb Details</h4>
            <ul>
              {product.details.map((detail, index) => (
                <li key={index}>✦ {detail}</li>
              ))}
            </ul>
          </div>

          <div className="size-selector">
            <div className="size-header">
              <span className="size-title">Select Size</span>
              <button className="size-guide-btn"><Ruler size={16} /> Size Guide</button>
            </div>
            <div className="size-options">
              {['XS', 'S', 'M', 'L', 'XL', 'Custom'].map(size => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="product-actions">
            <div className="dual-action-btns">
              <button className="btn btn-outline" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="btn btn-primary" onClick={handleOrderNow}>
                Buy Now
              </button>
            </div>
            <p className="bespoke-note">For bespoke measurements, select 'Custom' and provide details during checkout.</p>
          </div>

          <div className="trust-badges">
            <div className="badge">
              <ShieldCheck size={24} className="badge-icon" />
              <span>Authentic Weaves</span>
            </div>
            <div className="badge">
              <Truck size={24} className="badge-icon" />
              <span>Secure Nationwide Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDrawer;
