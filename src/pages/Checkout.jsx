import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShoppingBag, CreditCard, Smartphone, Truck, Trash2, Plus, Minus, Tag, X as XIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getCurrentUser, createOrder, validateCoupon } from '../lib/api';
import AuthModal from '../components/AuthModal';
import './Checkout.css';

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ['Cart', 'Details', 'Payment'];
const StepBar = ({ current }) => (
  <div className="step-bar">
    {STEPS.map((label, i) => (
      <div key={label} className={`step-item ${i <= current ? 'active' : ''} ${i < current ? 'done' : ''}`}>
        <div className="step-circle">{i < current ? '✓' : i + 1}</div>
        <span className="step-label">{label}</span>
        {i < STEPS.length - 1 && <div className="step-line" />}
      </div>
    ))}
  </div>
);

// ── Step 0: Multi-item Cart ───────────────────────────────────────────────────
const CartStep = ({ cartItems, totalPrice, onNext, removeFromCart, updateQty, coupon, setCoupon, couponDiscount, setCouponDiscount, orderNotes, setOrderNotes }) => {
  const [couponInput, setCouponInput] = useState(coupon?.code || '');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const { data, error } = await validateCoupon(couponInput.trim(), totalPrice);
    if (error) {
      setCouponError(error);
      setCoupon(null);
      setCouponDiscount(0);
    } else {
      setCoupon(data.coupon);
      setCouponDiscount(data.discount);
      setCouponError('');
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponDiscount(0);
    setCouponInput('');
    setCouponError('');
  };

  const finalTotal = Math.max(0, totalPrice - couponDiscount);

  if (!cartItems.length) {
    return (
      <div className="empty-cart">
        <ShoppingBag size={60} className="empty-cart-icon" />
        <h2>Your cart is empty</h2>
        <Link to="/collections" className="btn btn-gold" style={{ marginTop: 20 }}>Browse Collections</Link>
      </div>
    );
  }

  return (
    <div className="cart-step">
      <h2 className="step-title">Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h2>

      {cartItems.map((item) => (
        <div key={`${item.product.id}-${item.size}`} className="cart-item-card">
          <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
          <div className="cart-item-info">
            <h3 className="cart-item-name">{item.product.name}</h3>
            <p className="cart-item-cat">{item.product.category}</p>
            <p className="cart-item-size">Size: <strong>{item.size}</strong></p>
            <div className="cart-item-bottom">
              <div className="qty-control">
                <button onClick={() => updateQty(item.product.id, item.size, item.qty - 1)}><Minus size={14} /></button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item.product.id, item.size, item.qty + 1)}><Plus size={14} /></button>
              </div>
              <div className="cart-item-price">₹{((item.product.offer_price || item.product.price) * item.qty).toLocaleString('en-IN')}</div>
              <button className="cart-remove-btn" onClick={() => removeFromCart(item.product.id, item.size)} title="Remove">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ── Coupon Code ── */}
      <div className="coupon-section">
        <div className="coupon-label"><Tag size={14} /> Have a coupon code?</div>
        {coupon ? (
          <div className="coupon-applied">
            <span className="coupon-applied-code">🎟 {coupon.code}</span>
            <span className="coupon-applied-savings">−₹{couponDiscount.toLocaleString('en-IN')} saved</span>
            <button className="coupon-remove-btn" onClick={handleRemoveCoupon}><XIcon size={14} /></button>
          </div>
        ) : (
          <div className="coupon-input-row">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponInput}
              onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
              className="coupon-input"
            />
            <button className="btn btn-outline coupon-apply-btn" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()}>
              {couponLoading ? 'Checking...' : 'Apply'}
            </button>
          </div>
        )}
        {couponError && <p className="coupon-error">⚠ {couponError}</p>}
      </div>

      {/* ── Order Notes ── */}
      <div className="order-notes-section">
        <label className="order-notes-label">📝 Order Notes <span>(optional)</span></label>
        <textarea
          className="order-notes-input"
          placeholder="Stitching preferences, gift wrapping, delivery instructions, tailoring notes..."
          value={orderNotes}
          onChange={e => setOrderNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* ── Totals ── */}
      <div className="cart-totals">
        <div className="total-row"><span>Subtotal</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
        {couponDiscount > 0 && (
          <div className="total-row discount-row">
            <span>Coupon ({coupon?.code})</span>
            <span>−₹{couponDiscount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="total-row"><span>Shipping</span><span>Complimentary</span></div>
        <div className="total-row grand-total">
          <span>Total</span>
          <span>₹{finalTotal.toLocaleString('en-IN')}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="savings-badge">🎉 You save ₹{couponDiscount.toLocaleString('en-IN')} with this order!</div>
        )}
      </div>

      <button className="btn btn-primary full-width-btn" onClick={onNext}>
        Proceed to Details →
      </button>

      <Link to="/collections" className="continue-shopping-link">+ Continue Shopping</Link>
    </div>
  );
};

// ── Pincode → City/State lookup (India Post API) ──────────────────────────────
const fetchCityState = async (pincode, setFormData) => {
  if (pincode.length !== 6) return;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    if (data[0]?.Status === 'Success') {
      const info = data[0].PostOffice[0];
      setFormData(prev => ({
        ...prev,
        city: info.District,
        state: info.State,
      }));
    }
  } catch { /* silent fail */ }
};

// ── Step 1: Delivery details ──────────────────────────────────────────────────
const DetailsStep = ({ formData, onChange, onNext, onBack, hasCustomSize, setFormData }) => {
  const handleSubmit = (e) => { e.preventDefault(); onNext(); };

  const handlePincode = (e) => {
    onChange(e);
    fetchCityState(e.target.value, setFormData);
  };

  return (
    <div className="details-step">
      <h2 className="step-title">Delivery Details</h2>
      <form onSubmit={handleSubmit} className="minimal-form">

        {/* Row: Name + Phone */}
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" required value={formData.name} onChange={onChange} placeholder="E.g. Meera Sharma" />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={onChange} placeholder="+91 XXXXX XXXXX" />
          </div>
        </div>

        {/* House / Flat No */}
        <div className="form-group">
          <label htmlFor="houseNo">House / Flat No.</label>
          <input type="text" id="houseNo" name="houseNo" required value={formData.houseNo} onChange={onChange} placeholder="E.g. Flat 4B, 12/3" />
        </div>

        {/* Street / Lane */}
        <div className="form-group">
          <label htmlFor="street">Street / Lane Name</label>
          <input type="text" id="street" name="street" required value={formData.street} onChange={onChange} placeholder="E.g. MG Road, Banjara Hills Lane 2" />
        </div>

        {/* Colony / Area */}
        <div className="form-group">
          <label htmlFor="colony">Colony / Area / Locality</label>
          <input type="text" id="colony" name="colony" required value={formData.colony} onChange={onChange} placeholder="E.g. Jubilee Hills, Sector 14" />
        </div>

        {/* Row: Pincode + City + State */}
        <div className="form-row-3">
          <div className="form-group">
            <label htmlFor="pincode">Pincode</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              required
              maxLength={6}
              value={formData.pincode}
              onChange={handlePincode}
              placeholder="500001"
            />
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input type="text" id="city" name="city" required value={formData.city} onChange={onChange} placeholder="Auto-filled" />
          </div>
          <div className="form-group">
            <label htmlFor="state">State</label>
            <input type="text" id="state" name="state" required value={formData.state} onChange={onChange} placeholder="Auto-filled" />
          </div>
        </div>

        {hasCustomSize && (
          <div className="form-group">
            <label htmlFor="measurements">Bespoke Measurements</label>
            <textarea id="measurements" name="measurements" rows="2" value={formData.measurements} onChange={onChange} placeholder="Bust: 34in, Waist: 28in, Hips: 38in" />
          </div>
        )}

        <div className="step-nav">
          <button type="button" className="btn btn-outline" onClick={onBack}>← Back</button>
          <button type="submit" className="btn btn-primary">Continue to Payment →</button>
        </div>
      </form>
    </div>
  );
};

// ── Step 2: Payment ───────────────────────────────────────────────────────────
const openUpiApp = (appId, upiId, amount) => {
  const base = `pa=${upiId}&pn=Livaani&am=${amount}&cu=INR&tn=Livaani%20Order`;
  const links = {
    gpay:    `gpay://upi/pay?${base}`,
    phonepe: `phonepe://pay?${base}`,
    paytm:   `paytmmp://pay?${base}`,
    bhim:    `upi://pay?${base}`,
  };
  window.location.href = links[appId] || links.bhim;
};

const UPI_LOGOS = {
  gpay: (
    <img 
      src="https://cdn.worldvectorlogo.com/logos/google-pay-2.svg" 
      alt="Google Pay" 
      style={{ width: '28px', height: '28px', objectFit: 'contain' }}
    />
  ),
  phonepe: (
    <img 
      src="https://cdn.worldvectorlogo.com/logos/phonepe-4.svg" 
      alt="PhonePe" 
      style={{ width: '28px', height: '28px', objectFit: 'contain' }}
    />
  ),
  paytm: (
    <img 
      src="https://cdn.worldvectorlogo.com/logos/paytm.svg" 
      alt="Paytm" 
      style={{ width: '28px', height: '28px', objectFit: 'contain' }}
    />
  ),
  bhim: (
    <img 
      src="https://cdn.worldvectorlogo.com/logos/bhim-2.svg" 
      alt="BHIM" 
      style={{ width: '28px', height: '28px', objectFit: 'contain' }}
    />
  ),
};

const UPI_APPS = [
  { id: 'gpay', label: 'Google Pay' },
  { id: 'phonepe', label: 'PhonePe' },
  { id: 'paytm', label: 'Paytm' },
  { id: 'bhim', label: 'BHIM / Other' },
];

const PaymentStep = ({ onBack, onConfirm, isSubmitting, totalPrice }) => {
  const [method, setMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === 'number') value = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (name === 'expiry') value = value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
    if (name === 'cvv') value = value.replace(/\D/g, '').slice(0, 4);
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    if (!method) { alert('Please select a payment method.'); return; }
    if (method === 'upi') {
      if (!upiId.trim()) { alert('Please enter your UPI ID.'); return; }
      if (!selectedUpiApp) { alert('Please select a UPI app.'); return; }
      onConfirm(method, upiId, () => openUpiApp(selectedUpiApp, upiId, totalPrice));
      return;
    }
    if (method === 'card') {
      if (!card.number || !card.name || !card.expiry || !card.cvv) { alert('Please fill all card details.'); return; }
    }
    onConfirm(method, upiId);
  };

  return (
    <div className="payment-step">
      <h2 className="step-title">Payment Method</h2>
      <div className="payment-methods">

        {/* UPI */}
        <div className={`payment-card ${method === 'upi' ? 'selected' : ''}`} onClick={() => setMethod('upi')}>
          <div className="payment-icon"><Smartphone size={26} /></div>
          <div className="payment-info">
            <div className="payment-label">UPI</div>
            <div className="payment-desc">Google Pay, PhonePe, Paytm, BHIM</div>
          </div>
          <div className="payment-radio">{method === 'upi' ? '●' : '○'}</div>
        </div>
        {method === 'upi' && (
          <div className="payment-expand">
            <div className="form-group">
              <label>Your UPI ID</label>
              <input type="text" placeholder="yourname@okhdfcbank" value={upiId} onChange={e => setUpiId(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>Select UPI App to Pay</label>
              <div className="upi-app-grid">
                {UPI_APPS.map(app => (
                  <button key={app.id} type="button" className={`upi-app-btn ${selectedUpiApp === app.id ? 'active' : ''}`} onClick={() => setSelectedUpiApp(app.id)}>
                    <span className="upi-app-logo">{UPI_LOGOS[app.id]}</span>
                    <span>{app.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="upi-redirect-note">After placing the order you'll be redirected to your UPI app to approve payment.</p>
          </div>
        )}

        {/* Card */}
        <div className={`payment-card ${method === 'card' ? 'selected' : ''}`} onClick={() => setMethod('card')}>
          <div className="payment-icon"><CreditCard size={26} /></div>
          <div className="payment-info">
            <div className="payment-label">Credit / Debit Card</div>
            <div className="payment-desc">Visa, Mastercard, Rupay</div>
          </div>
          <div className="payment-radio">{method === 'card' ? '●' : '○'}</div>
        </div>
        {method === 'card' && (
          <div className="payment-expand">
            <div className="form-group">
              <label>Card Number</label>
              <input type="text" name="number" placeholder="1234 5678 9012 3456" value={card.number} onChange={handleCardChange} maxLength={19} />
            </div>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label>Name on Card</label>
              <input type="text" name="name" placeholder="As printed on card" value={card.name} onChange={handleCardChange} />
            </div>
            <div className="card-row" style={{ marginTop: 14 }}>
              <div className="form-group">
                <label>Expiry</label>
                <input type="text" name="expiry" placeholder="MM/YY" value={card.expiry} onChange={handleCardChange} maxLength={5} />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input type="password" name="cvv" placeholder="•••" value={card.cvv} onChange={handleCardChange} maxLength={4} />
              </div>
            </div>
          </div>
        )}

        {/* COD */}
        <div className={`payment-card ${method === 'cod' ? 'selected' : ''}`} onClick={() => setMethod('cod')}>
          <div className="payment-icon"><Truck size={26} /></div>
          <div className="payment-info">
            <div className="payment-label">Cash on Delivery</div>
            <div className="payment-desc">Pay when your order arrives</div>
          </div>
          <div className="payment-radio">{method === 'cod' ? '●' : '○'}</div>
        </div>
        {method === 'cod' && (
          <div className="payment-expand">
            <p>🚚 You'll pay in cash when your order is delivered to your doorstep.</p>
          </div>
        )}
      </div>

      <div className="payment-total-bar">
        <span>Total Payable</span>
        <span className="payment-total-amount">₹{totalPrice.toLocaleString('en-IN')}</span>
      </div>

      <div className="step-nav">
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Placing Order...' : 'Place Order ✦'}
        </button>
      </div>
    </div>
  );
};

// ── Thank You Splash (video → order summary) ─────────────────────────────────
const ThankYouSplash = ({ ordersPlaced, formData, totalPrice, fallbackId }) => {
  const [showOrder, setShowOrder] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Auto-transition after 5s whether video plays or not
    const timer = setTimeout(() => setShowOrder(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (showOrder) {
    return (
      <div className="checkout-success container">
        <div className="success-card animate-fade-in-up">
          <CheckCircle2 size={80} className="success-icon" />
          <h1 className="success-title">Order{ordersPlaced.length > 1 ? 's' : ''} Confirmed!</h1>
          <p className="success-desc">
            Your attire is being prepared. We will reach you at <strong>{formData.phone}</strong> with updates.
          </p>
          <div className="order-summary-box">
            {ordersPlaced.map((o, i) => (
              <p key={i}><strong>{o?.product_name || `Item ${i + 1}`}</strong> — Order #{(o?._id || fallbackId.current).toString().slice(-6).toUpperCase()}</p>
            ))}
            <p style={{ marginTop: 10 }}><strong>Total Paid:</strong> ₹{totalPrice > 0 ? totalPrice.toLocaleString('en-IN') : ordersPlaced.reduce((s, o) => s + (o?.price || 0), 0).toLocaleString('en-IN')}</p>
          </div>
          <Link to="/" className="btn btn-gold" style={{ marginTop: 24 }}>Return to Collections</Link>
          <a
            href="https://wa.me/919876543210?text=My%20order%20has%20been%20placed%20at%20Livaani!"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ background: '#25D366', color: 'white', marginTop: 12 }}
          >
            📲 Get WhatsApp Updates
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="thankyou-splash">
      {/* Background video */}
      <video
        ref={videoRef}
        className="thankyou-video"
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        controlsList="nodownload"
        onEnded={() => setShowOrder(true)}
        src="/videos/thankyou.mp4"
      >
        <track kind="captions" default={false} />
      </video>

      {/* Overlay */}
      <div className="thankyou-overlay">
        <div className="thankyou-content animate-fade-in-up">
          <div className="thankyou-ornament">✦</div>
          <h1 className="thankyou-heading">Thank You</h1>
          <p className="thankyou-subtext">for choosing Livaani</p>
          <p className="thankyou-quote">"Luxury is in each detail."</p>
          <div className="thankyou-divider"></div>
          <button
            className="thankyou-skip"
            onClick={() => setShowOrder(true)}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Checkout ─────────────────────────────────────────────────────────────
const Checkout = () => {
  const { cartItems, removeFromCart, updateQty, clearCart, totalPrice } = useCart();
  const [step, setStep] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ordersPlaced, setOrdersPlaced] = useState(null);
  const navigate = useNavigate();
  const fallbackId = useRef('Livaani-' + Math.floor(Math.random() * 90000 + 10000));

  // Coupon state
  const [coupon, setCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Order notes state
  const [orderNotes, setOrderNotes] = useState('');

  // Load saved delivery details from localStorage
  const savedDetails = (() => {
    try { return JSON.parse(localStorage.getItem('livn_delivery') || '{}'); } catch { return {}; }
  })();

  const [formData, setFormData] = useState({
    name:         savedDetails.name         || '',
    phone:        savedDetails.phone        || '',
    houseNo:      savedDetails.houseNo      || '',
    street:       savedDetails.street       || '',
    colony:       savedDetails.colony       || '',
    pincode:      savedDetails.pincode      || '',
    city:         savedDetails.city         || '',
    state:        savedDetails.state        || '',
    measurements: '',
  });

  const hasCustomSize = cartItems.some(i => i.size === 'Custom');

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  // Save delivery details whenever they change
  useEffect(() => {
    const { measurements, ...toSave } = formData;
    localStorage.setItem('livn_delivery', JSON.stringify(toSave));
  }, [formData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCartNext = () => {
    if (!cartItems.length) return;
    const currentUser = getCurrentUser();
    if (!currentUser) { setShowAuth(true); return; }
    setStep(1);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setStep(1);
  };

  // Place one order per cart item
  const handleConfirmOrder = async (paymentMethod, upiId, onAfter) => {
    setIsSubmitting(true);
    const fullAddress = `${formData.houseNo}, ${formData.street}, ${formData.colony}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
    const finalTotal = Math.max(0, totalPrice - couponDiscount);
    try {
      const results = [];
      for (const item of cartItems) {
        const itemPrice = (item.product.offer_price || item.product.price) * item.qty;
        // Distribute coupon discount proportionally across items
        const itemDiscount = totalPrice > 0 ? Math.round((itemPrice / totalPrice) * couponDiscount) : 0;
        const payload = {
          product_id:       String(item.product._id || item.product.id || ''),
          product_name:     item.product.name,
          price:            itemPrice - itemDiscount,
          customer_name:    formData.name,
          customer_phone:   formData.phone,
          customer_email:   getCurrentUser()?.email || '',
          shipping_address: fullAddress,
          measurements:     formData.measurements || (item.size === 'Custom' ? item.measurements : ''),
          selected_size:    item.size,
          quantity:         item.qty,
          payment_method:   paymentMethod,
          upi_id:           upiId || '',
          order_notes:      orderNotes || '',
          coupon_code:      coupon?.code || '',
          discount_amount:  itemDiscount,
        };
        const { data, error } = await createOrder(payload);
        if (error) throw new Error(error);
        results.push(data);
      }
      setOrdersPlaced(results);
      clearCart();
      if (onAfter) onAfter();
    } catch (err) {
      alert('Order failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Thank you video splash → then success screen ───────────────────────────
  if (ordersPlaced) {
    return <ThankYouSplash ordersPlaced={ordersPlaced} formData={formData} totalPrice={totalPrice} fallbackId={fallbackId} />;
  }

  return (
    <div className="checkout-page container">
      <button className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}>
        <ArrowLeft size={18} /><span style={{ marginLeft: 6 }}>Back</span>
      </button>

      <StepBar current={step} />

      <div className="checkout-layout grid grid-cols-2">
        <div className="checkout-form-section animate-fade-in-up">
          {step === 0 && (
            <CartStep
              cartItems={cartItems}
              totalPrice={totalPrice}
              onNext={handleCartNext}
              removeFromCart={removeFromCart}
              updateQty={updateQty}
              coupon={coupon}
              setCoupon={setCoupon}
              couponDiscount={couponDiscount}
              setCouponDiscount={setCouponDiscount}
              orderNotes={orderNotes}
              setOrderNotes={setOrderNotes}
            />
          )}
          {step === 1 && (
            <DetailsStep
              formData={formData}
              onChange={handleFormChange}
              setFormData={setFormData}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
              hasCustomSize={hasCustomSize}
            />
          )}
          {step === 2 && (
            <PaymentStep
              onBack={() => setStep(1)}
              onConfirm={handleConfirmOrder}
              isSubmitting={isSubmitting}
              totalPrice={Math.max(0, totalPrice - couponDiscount)}
            />
          )}
        </div>

        {/* Order summary sidebar */}
        {cartItems.length > 0 && (
          <div className="checkout-summary animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>
              <div className="temple-divider" style={{ margin: '15px 0' }}></div>
              {cartItems.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="summary-product">
                  <img src={item.product.image} alt={item.product.name} className="summary-image" />
                  <div className="summary-details">
                    <h4 className="summary-product-name">{item.product.name}</h4>
                    <p className="summary-product-cat">{item.product.category}</p>
                    <p className="summary-size">Size: {item.size} {item.qty > 1 ? `× ${item.qty}` : ''}</p>
                    <div className="summary-price">₹{((item.product.offer_price || item.product.price) * item.qty).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
              <div className="summary-totals">
                <div className="total-row"><span>Subtotal</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
                <div className="total-row"><span>Shipping</span><span>Complimentary</span></div>
                <div className="total-row grand-total"><span>Total</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
};

export default Checkout;
