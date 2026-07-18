import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../data/products';
import { ArrowLeft, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { saveRecentlyViewed } from '../hooks/useRecentlyViewed';
import './ProductPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const product = getProductById(id);
  const [selectedSize, setSelectedSize] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Track this product as recently viewed
    if (product) {
      saveRecentlyViewed(product);
    }
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, selectedSize || 'Standard');
    // Stay on page — user can keep browsing
  };

  const handleOrderNow = () => {
    addToCart(product, selectedSize || 'Standard');
    navigate('/checkout');
  };

  if (!product) {
    return (
      <div className="container" style={{ padding: '150px 0', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <Link to="/" className="btn btn-gold" style={{ marginTop: '50px' }}>Back to Collections</Link>
      </div>
    );
  }

  return (
    <div className="product-page container">
      <Link to="/" className="back-link">
        <ArrowLeft size={18} />
        <span>Back to Collections</span>
      </Link>

      <div className="product-layout grid grid-cols-2">
        {/* Image Section */}
        <div className="product-gallery">
          <div className="product-main-image-container">
            <img src={product.image} alt={product.name} className="product-main-image animate-fade-in-up" />
            <div className="temple-frame"></div>
          </div>
        </div>

        {/* Details Section */}
        <div className="product-details animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="product-meta">{product.category} Collection</p>
          <h1 className="product-name">{product.name}</h1>
          <div className="product-price-large">₹{product.price.toLocaleString('en-IN')}</div>
          
          <div className="product-divider">
            <div className="carving-icon">✦</div>
          </div>

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
              <span>Authentic Temple Weaves</span>
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

export default ProductPage;
