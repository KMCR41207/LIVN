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
              <th>Size</th><th>Chest</th><th>Waist</th><th>Hips</th><th>Length</th>
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
      <p className="size-guide-tip">✦ For a perfect fit, choose Custom and enter your measurements.</p>
    </div>
  </div>
);

const ProductDrawer = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  // Build images array — use images[] if available, else fall back to image
  const allImages = (product?.images && product.images.length > 0)
    ? product.images
    : (product?.image ? [product.image] : []);

  // Custom measurements
  const [measurements, setMeasurements] = useState({
    chest: '', waist: '', hips: '', length: '', notes: ''
  });
  const [measureError, setMeasureError] = useState('');

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

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setSizeError(false);
    setMeasureError('');
  };

  const validate = () => {
    if (!selectedSize) {
      setSizeError(true);
      return false;
    }
    if (selectedSize === 'Custom') {
      if (!measurements.chest || !measurements.waist || !measurements.hips || !measurements.length) {
        setMeasureError('Please fill in all measurement fields.');
        return false;
      }
    }
    return true;
  };

  const buildMeasurementNote = () => {
    if (selectedSize !== 'Custom') return '';
    return `Chest:${measurements.chest}" Waist:${measurements.waist}" Hips:${measurements.hips}" Length:${measurements.length}"${measurements.notes ? ' Notes:' + measurements.notes : ''}`;
  };

  const handleAddToCart = () => {
    if (!validate()) return;
    addToCart(product, selectedSize, buildMeasurementNote());
    onClose();
  };

  const handleOrderNow = () => {
    if (!validate()) return;
    addToCart(product, selectedSize, buildMeasurementNote());
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}>
        <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          <button className="drawer-close" onClick={onClose}><X size={22} /></button>

          <div className="drawer-image-container">
            {/* Main image */}
            <img src={allImages[activeImg] || product.image} alt={product.name} className="drawer-image" />
            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="drawer-thumbnails">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`drawer-thumb ${activeImg === idx ? 'active' : ''}`}
                    onClick={() => setActiveImg(idx)}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-content">
            <p className="product-meta">{product.category} Collection</p>
            <h2 className="product-name">{product.name}</h2>
            {product.offer_price && product.offer_price < product.price ? (
              <div className="product-price-large">
                <span className="drawer-offer-price">₹{product.offer_price.toLocaleString('en-IN')}</span>
                <span className="drawer-mrp">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="drawer-discount-badge">
                  {Math.round(((product.price - product.offer_price) / product.price) * 100)}% off
                </span>
              </div>
            ) : (
              <div className="product-price-large">₹{(product.price || 0).toLocaleString('en-IN')}</div>
            )}

            <div className="product-divider"><div className="carving-icon">✦</div></div>

            <p className="product-description">{product.description}</p>

            {product.details && product.details.length > 0 && (
              <div className="product-features">
                <h4 className="features-title">Garb Details</h4>
                <ul>
                  {product.details.map((detail, index) => (
                    <li key={index}>✦ {detail}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Size Selector ── */}
            <div className="size-selector">
              <div className="size-header">
                <span className="size-title">Select Size</span>
                <button className="size-guide-btn" onClick={() => setShowSizeGuide(true)}>
                  <Ruler size={16} /> Size Guide
                </button>
              </div>
              <div className="size-options">
                {['XS', 'S', 'M', 'L', 'XL', 'Custom'].map(size => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''} ${size === 'Custom' ? 'custom-btn' : ''}`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="size-error">⚠ Please select a size before continuing.</p>
              )}
            </div>

            {/* ── Custom Measurements Form ── */}
            {selectedSize === 'Custom' && (
              <div className="custom-measurements">
                <h4 className="measurements-title">✦ Your Measurements <span>(in inches)</span></h4>
                <div className="measurements-grid">
                  <div className="measure-field">
                    <label>Chest *</label>
                    <input
                      type="number"
                      placeholder='e.g. 36"'
                      value={measurements.chest}
                      onChange={(e) => { setMeasurements({ ...measurements, chest: e.target.value }); setMeasureError(''); }}
                    />
                  </div>
                  <div className="measure-field">
                    <label>Waist *</label>
                    <input
                      type="number"
                      placeholder='e.g. 30"'
                      value={measurements.waist}
                      onChange={(e) => { setMeasurements({ ...measurements, waist: e.target.value }); setMeasureError(''); }}
                    />
                  </div>
                  <div className="measure-field">
                    <label>Hips *</label>
                    <input
                      type="number"
                      placeholder='e.g. 38"'
                      value={measurements.hips}
                      onChange={(e) => { setMeasurements({ ...measurements, hips: e.target.value }); setMeasureError(''); }}
                    />
                  </div>
                  <div className="measure-field">
                    <label>Length *</label>
                    <input
                      type="number"
                      placeholder='e.g. 42"'
                      value={measurements.length}
                      onChange={(e) => { setMeasurements({ ...measurements, length: e.target.value }); setMeasureError(''); }}
                    />
                  </div>
                </div>
                <div className="measure-field" style={{ marginTop: '10px' }}>
                  <label>Special Notes (optional)</label>
                  <textarea
                    placeholder="e.g. Slightly loose around shoulders, prefer longer sleeves..."
                    value={measurements.notes}
                    onChange={(e) => setMeasurements({ ...measurements, notes: e.target.value })}
                  />
                </div>
                {measureError && <p className="size-error">⚠ {measureError}</p>}
              </div>
            )}

            {/* ── Actions ── */}
            <div className="product-actions">
              <div className="dual-action-btns">
                <button
                  className={`btn btn-outline ${!selectedSize ? 'btn-disabled' : ''}`}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
                <button
                  className={`btn btn-primary ${!selectedSize ? 'btn-disabled' : ''}`}
                  onClick={handleOrderNow}
                >
                  Buy Now
                </button>
              </div>
              {!selectedSize && (
                <p className="bespoke-note" style={{ color: 'var(--color-maroon)', fontWeight: '600' }}>
                  ← Select a size to continue
                </p>
              )}
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
