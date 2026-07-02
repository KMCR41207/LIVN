import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle2, Truck, Scissors, Clock, MapPin } from 'lucide-react';
import { getCurrentUser, getMyOrders } from '../lib/api';
import AuthModal from '../components/AuthModal';
import './TrackOrder.css';

const STATUS_STEPS = ['New', 'Stitching', 'Ready', 'Sent', 'Delivered'];

const STATUS_ICONS = {
  New:       <Clock size={20} />,
  Stitching: <Scissors size={20} />,
  Ready:     <Package size={20} />,
  Sent:      <Truck size={20} />,
  Delivered: <CheckCircle2 size={20} />,
};

const STATUS_DESC = {
  New:       'Order received and confirmed.',
  Stitching: 'Your garment is being crafted.',
  Ready:     'Your order is packed and ready to ship.',
  Sent:      'Out for delivery with our courier partner.',
  Delivered: 'Delivered successfully. Enjoy your Livaani piece!',
};

const OrderCard = ({ order }) => {
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <div className="order-id">Order #{order._id.slice(-8).toUpperCase()}</div>
          <div className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div className={`order-status-badge status-${order.status?.toLowerCase()}`}>
          {order.status}
        </div>
      </div>

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
          <div key={step} className={`progress-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
            <div className="progress-icon">{STATUS_ICONS[step]}</div>
            <div className="progress-label">{step}</div>
            {i < STATUS_STEPS.length - 1 && <div className="progress-line" />}
          </div>
        ))}
      </div>

      <div className="order-status-desc">
        <MapPin size={15} /> {STATUS_DESC[order.status] || 'Processing your order.'}
      </div>

      <div className="order-address">
        <strong>Delivering to:</strong> {order.shipping_address}
      </div>
    </div>
  );
};

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    window.scrollTo(0, 0);
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // fetch inline to avoid dependency issues
      setLoading(true);
      getMyOrders()
        .then(({ data, error }) => {
          if (!error) setOrders(data || []);
          else setOrders([]);
        })
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setShowAuth(true);
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await getMyOrders();
      if (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (u) => {
    setUser(u);
    setShowAuth(false);
    // fetch orders for newly logged in user
    setLoading(true);
    getMyOrders()
      .then(({ data, error }) => {
        setOrders(!error ? (data || []) : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  return (
    <div className="track-order-page container">
      <div className="track-order-header">
        <h1>Track Your Orders</h1>
        <p>View the status of all your Livaani orders in one place.</p>
      </div>

      {loading ? (
        <div className="track-loading">Loading your orders...</div>
      ) : !user ? (
        <div className="track-auth-prompt">
          <Package size={60} className="track-empty-icon" />
          <h2>Sign in to view your orders</h2>
          <p>You need to be logged in to track your orders.</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowAuth(true)}>
            Sign In
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="track-empty">
          <Package size={60} className="track-empty-icon" />
          <h2>No orders yet</h2>
          <p>You haven't placed any orders from this profile.</p>
          <Link to="/collections" className="btn btn-gold" style={{ marginTop: 20 }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
};

export default TrackOrder;
