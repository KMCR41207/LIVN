import { useState } from 'react';
import { Bell, Truck, Tag, CheckCircle2 } from 'lucide-react';
import './WhatsApp.css';

const WhatsAppIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5.563 7.563l-1.5 7.07c-.11.52-.4.65-.81.4l-2.25-1.7-1.08 1.04c-.12.12-.22.22-.46.22l.17-2.33 4.22-3.81c.18-.16-.04-.25-.28-.09L8.4 14.09l-2.19-.68c-.48-.15-.49-.48.1-.71l8.57-3.3c.4-.15.75.1.65.71z" />
  </svg>
);

const NOTIFICATION_TYPES = [
  {
    id: 'order_confirmation',
    icon: <CheckCircle2 size={26} />,
    title: 'Order Confirmation',
    desc: 'Get an instant WhatsApp message the moment your order is placed — with full order details.',
  },
  {
    id: 'shipping_updates',
    icon: <Truck size={26} />,
    title: 'Shipping Updates',
    desc: 'Track your package with live WhatsApp alerts at every stage — from dispatch to delivery.',
  },
  {
    id: 'exclusive_offers',
    icon: <Tag size={26} />,
    title: 'Exclusive Offers',
    desc: 'Be the first to know about seasonal sales, new arrivals, and members-only discounts.',
  },
];

const WhatsApp = () => {
  const [phone, setPhone] = useState('');
  const [toggles, setToggles] = useState({
    order_confirmation: true,
    shipping_updates: true,
    exclusive_offers: false,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (id) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    setSaved(true);
    // Persist to localStorage
    localStorage.setItem('livn_wa_prefs', JSON.stringify({ phone, toggles }));
  };

  return (
    <div className="whatsapp-page container section-padding">
      <div className="wa-hero">
        <WhatsAppIcon />
        <h1 className="wa-title">WhatsApp Notifications</h1>
        <p className="wa-subtitle">
          Stay informed about your orders and exclusive Livaani offers — directly on WhatsApp.
        </p>
      </div>

      <form className="wa-form" onSubmit={handleSave} noValidate>
        {/* Phone input */}
        <div className="wa-phone-group">
          <label htmlFor="wa-phone" className="wa-phone-label">Your WhatsApp Number</label>
          <div className="wa-phone-input-wrap">
            <span className="wa-phone-prefix">+91</span>
            <input
              id="wa-phone"
              type="tel"
              className="wa-phone-input"
              placeholder="98765 43210"
              value={phone}
              onChange={e => { setPhone(e.target.value); setSaved(false); setError(''); }}
              maxLength={10}
            />
          </div>
          {error && <p className="wa-error">{error}</p>}
        </div>

        {/* Notification Cards */}
        <div className="wa-cards">
          {NOTIFICATION_TYPES.map((item) => (
            <div
              key={item.id}
              className={`wa-card ${toggles[item.id] ? 'wa-card--active' : ''}`}
            >
              <div className="wa-card-icon">{item.icon}</div>
              <div className="wa-card-body">
                <h3 className="wa-card-title">{item.title}</h3>
                <p className="wa-card-desc">{item.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={toggles[item.id]}
                className={`wa-toggle ${toggles[item.id] ? 'wa-toggle--on' : ''}`}
                onClick={() => handleToggle(item.id)}
                aria-label={`Toggle ${item.title}`}
              >
                <span className="wa-toggle-knob" />
              </button>
            </div>
          ))}
        </div>

        <div className="wa-save-row">
          <button type="submit" className="btn btn-primary wa-save-btn">
            <Bell size={17} />
            Save Preferences
          </button>
          {saved && (
            <span className="wa-saved-msg">
              <CheckCircle2 size={16} /> Preferences saved!
            </span>
          )}
        </div>
      </form>

      <p className="wa-disclaimer">
        We will only send you messages about your orders and offers. You can unsubscribe anytime by replying STOP.
      </p>
    </div>
  );
};

export default WhatsApp;
