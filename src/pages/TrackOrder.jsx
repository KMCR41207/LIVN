import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, CheckCircle2, Truck, Scissors, Clock,
  MapPin, RefreshCw, ChevronDown, ChevronUp, User, History
} from 'lucide-react';
import { getCurrentUser, getMyOrders } from '../lib/api';
import AuthModal from '../components/AuthModal';
import './TrackOrder.css';
import './WhatsApp.css';

const STATUS_STEPS = ['New', 'Stitching', 'Ready', 'Sent', 'Delivered'];

const STATUS_ICONS = {
  New:       <Clock size={18} />,
  Stitching: <Scissors size={18} />,
  Ready:     <Package size={18} />,
  Sent:      <Truck size={18} />,
  Delivered: <CheckCircle2 size={18} />,
};

const STATUS_DESC = {
  New:       'Order received and confirmed.',
  Stitching: 'Your garment is being crafted by our artisans.',
  Ready:     'Your order is packed and ready to dispatch.',
  Sent:      'Out for delivery with our courier partner.',
  Delivered: 'Delivered successfully. Enjoy your Livaani piece!',
};

const STATUS_COLORS = {
  New:       { bg: '#e3f2fd', color: '#1565c0' },
  Stitching: { bg: '#f3e5f5', color: '#6a1b9a' },
  Ready:     { bg: '#e8f5e9', color: '#2e7d32' },
  Sent:      { bg: '#fff3e0', color: '#e65100' },
  Delivered: { bg: '#fdf6e3', color: '#7a4f00' },
};

// ── Status History Timeline ──────────────────────────────────────────────────
const StatusHistory = ({ history }) => {
  if (!history || history.length === 0) return null;
  return (
    <div className="status-history">
      <h4 className="history-title"><History size={14} /> Order History</h4>
      <div className="history-timeline">
        {[...history].reverse().map((entry, i) => {
          const colors = STATUS_COLORS[entry.status] || { bg: '#f5f5f5', color: '#333' };
          return (
            <div key={i} className="history-entry">
              <div className="history-dot" style={{ background: colors.color }} />
              <div className="history-content">
                <span className="history-status" style={{ color: colors.color }}>{entry.status}</span>
                {entry.note && <span className="history-note">— {entry.note}</span>}
                <span className="history-time">
                  {new Date(entry.updatedAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const colors = STATUS_COLORS[order.status] || {};

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <div className="order-id">Order #{order._id.slice(-8).toUpperCase()}</div>
          <div className="order-date">
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
        </div>
        <div className="order-status-badge"
          style={{ background: colors.bg, color: colors.color }}>
          {order.status}
        </div>
      </div>

      {/* Product info */}
      <div className="order-product-row">
        <div className="order-product-info">
          <div className="order-product-name">{order.product_name}</div>
          <div className="order-product-meta">Size: {order.selected_size} &nbsp;|&nbsp; Qty: {order.quantity || 1}</div>
          <div className="order-product-meta">Payment: {order.payment_method?.toUpperCase()}</div>
        </div>
        <div className="order-product-price">₹{order.price?.toLocaleString('en-IN')}</div>
      </div>

      {/* Progress tracker */}
      <div className="order-progress">
        {STATUS_STEPS.map((step, i) => (
          <div key={step}
            className={`progress-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
            <div className="progress-icon">{STATUS_ICONS[step]}</div>
            <div className="progress-label">{step}</div>
            {i < STATUS_STEPS.length - 1 && <div className="progress-line" />}
          </div>
        ))}
      </div>

      <div className="order-status-desc">
        <MapPin size={15} /> {STATUS_DESC[order.status] || 'Processing your order.'}
      </div>

      {/* Toggle history */}
      <button className="history-toggle-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Hide History' : 'View Update History'}
        {order.statusHistory?.length > 0 && (
          <span className="history-count-badge">{order.statusHistory.length}</span>
        )}
      </button>

      {expanded && (
        <>
          <StatusHistory history={order.statusHistory} />
          <div className="order-address">
            <strong>Delivering to:</strong> {order.shipping_address}
          </div>
        </>
      )}

      {!expanded && (
        <div className="order-address">
          <strong>Delivering to:</strong> {order.shipping_address}
        </div>
      )}

      <a
        href={`https://wa.me/?text=My%20Livaani%20order%20%23${order._id.slice(-8).toUpperCase()}%20is%20${order.status}!`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-share-btn"
      >
        📲 Share on WhatsApp
      </a>
    </div>
  );
};

// ── Main TrackOrder Page ─────────────────────────────────────────────────────
const TrackOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data, error } = await getMyOrders();
      if (!error) setOrders(data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      fetchOrders();
      // Poll every 30s for real-time status updates
      const interval = setInterval(() => fetchOrders(true), 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      setShowAuth(true);
    }
  }, [user, fetchOrders]);

  const handleAuthSuccess = (u) => {
    setUser(u);
    setShowAuth(false);
  };

  // Split orders into active and delivered (history)
  const activeOrders = orders.filter(o => o.status !== 'Delivered');
  const historyOrders = orders.filter(o => o.status === 'Delivered');

  const displayOrders = activeTab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="track-order-page container">
      {/* Header with user profile */}
      <div className="track-order-header">
        {user && (
          <div className="user-profile-badge">
            <div className="user-avatar">
              <User size={24} />
            </div>
            <div className="user-info">
              <div className="user-name">{user.email?.split('@')[0]}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
        )}
        <h1>My Orders</h1>
        <p>Track your Livaani orders in real time — updates every 30 seconds.</p>

        {user && (
          <button
            className="refresh-btn"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="track-loading">
          <div className="track-loading-spinner" />
          Loading your orders...
        </div>
      ) : !user ? (
        <div className="track-auth-prompt">
          <Package size={60} className="track-empty-icon" />
          <h2>Sign in to view your orders</h2>
          <p>You need to be logged in to track your orders.</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowAuth(true)}>
            Sign In
          </button>
        </div>
      ) : (
        <>
          {/* Tab switcher */}
          <div className="order-tabs">
            <button
              className={`order-tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              <Package size={16} />
              Active Orders
              {activeOrders.length > 0 && <span className="tab-badge">{activeOrders.length}</span>}
            </button>
            <button
              className={`order-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={16} />
              Order History
              {historyOrders.length > 0 && <span className="tab-badge">{historyOrders.length}</span>}
            </button>
          </div>

          {displayOrders.length === 0 ? (
            <div className="track-empty">
              <Package size={60} className="track-empty-icon" />
              {activeTab === 'active' ? (
                <>
                  <h2>No active orders</h2>
                  <p>You have no orders currently in progress.</p>
                  <Link to="/collections" className="btn btn-gold" style={{ marginTop: 20 }}>
                    Start Shopping
                  </Link>
                </>
              ) : (
                <>
                  <h2>No order history</h2>
                  <p>Your delivered orders will appear here.</p>
                </>
              )}
            </div>
          ) : (
            <div className="orders-list">
              {displayOrders.map(order => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </>
      )}

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
};

export default TrackOrder;
