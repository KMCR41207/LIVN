import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductDrawer.css';

// ── Size Guide Modal ──────────────────────────────────────────────────────────
const SizeGuideModal = ({ onClose }) => (
  <div className="size-guide-overlay" onClick={onClose}>
    <div className="size-guide-modal" onClick={e => e.stopPropagation()}>
      <button className="size-guide-close" onClick={onClose}><X size={18} /></button>
      <h3 className="size-guide-title">Size Guide</h3>
      <p className="size-guide-note">All measurements in inches</p>
      <div className="size-guide-table-wrap">
        <table className="size-guide-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Chest</th>
              <th>Waist</th>
              <th>Hips</th>
              <th>Length</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>XS</td><td>32</td><td>26</td><td>34</td><td>40</td></tr>
            <tr><td>S</td><td>34</td><td>28</td><td>36</td><td>41</td></tr>
            <tr><td>M</td><td>36</td><td>30</td><td>38</td><td>42</td></tr>
            <tr><td>L</td><td>38</td><td>32</td><td>40</td><td>43</td></tr>
            <tr><td>XL</td><td>40</td><td>34</td><td>42</td><td>44</td></tr>
          </tbody>
        </table>
      </div>
      <p className="size-guide-tip">✦ For a perfect fit, choose Custom and enter your measurements at checkout.</p>
    </div>
  </div>
);

const ProductDrawer = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

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
  };

  const handleOrderNow = () => {
    addToCart(product, selectedSize || 'Standard');
    onClose();
    navigate('/checkout');
  };

  return (
    <>
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
                <button
                  className="size-guide-btn"
                  onClick={() => setShowSizeGuide(true)}
                >
                  <Ruler size={16} /> Size Guide
                </button>
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
                <button className="btn btn-outline" onClick={handleAddToCart}>Add to Cart</button>
                <button className="btn btn-primary" onClick={handleOrderNow}>Buy Now</button>
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

      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}
    </>
  );
};

export default ProductDrawer;
