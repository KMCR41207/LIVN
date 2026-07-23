import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AccountPages.css';

const API = import.meta.env.VITE_API_URL || '/api';

const YourOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const getToken = () => accessToken || localStorage.getItem('livn_token');

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('Not logged in');

      // Use /my endpoint — returns only this user's orders
      const response = await fetch(`${API}/orders/my`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (response.status === 403) {
        // Fallback: filter by email from general endpoint won't work for non-admins
        setOrders([]);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server error. Please try again.');
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch orders');
      }

      const result = await response.json();
      setOrders(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <CheckCircle size={16} className="status-icon delivered" />;
      case 'shipped':
      case 'in transit': return <Truck size={16} className="status-icon shipped" />;
      case 'processing':
      case 'pending': return <Clock size={16} className="status-icon processing" />;
      case 'cancelled': return <AlertCircle size={16} className="status-icon cancelled" />;
      default: return <Package size={16} className="status-icon" />;
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  // Check if order can be tracked (not delivered)
  const canTrackOrder = (order) => {
    return order.status?.toLowerCase() !== 'delivered';
  };

  // Check if exchange is available (within 7 days of ordering)
  const canExchange = (order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  };

  if (isLoading) return <div className="loading">Loading your orders…</div>;

  return (
    <div className="account-page">
      <div className="page-header-row">
        <h2 className="account-section-title">Your Orders</h2>
        <button className="refresh-btn" onClick={fetchOrders} title="Refresh orders">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button className="retry-link" onClick={fetchOrders}>Try again</button>
        </div>
      )}

      {!error && orders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
          <Link to="/collections" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const orderId = order._id?.toString().slice(-8).toUpperCase();
            return (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h4>Order #{order.orderNumber || orderId}</h4>
                    <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                    {order.customer_name && (
                      <p className="order-date">{order.customer_name}</p>
                    )}
                  </div>
                  <div className="order-status">
                    {getStatusIcon(order.status)}
                    <span className={`status-badge ${order.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Order item details */}
                <div className="order-items">
                  <div className="order-item">
                    {order.image && (
                      <img src={order.image} alt={order.product_name} className="item-image" />
                    )}
                    <div className="item-details">
                      <p className="item-name">{order.product_name || 'Livaani Order'}</p>
                      {order.size && <p className="item-meta">Size: {order.size}</p>}
                      {order.colour && <p className="item-meta">Colour: {order.colour}</p>}
                      <p className="item-meta">
                        Qty: {order.quantity || 1}
                        {order.price ? ` × ₹${order.price}` : ''}
                      </p>
                      {order.fabric && <p className="item-meta">Fabric: {order.fabric}</p>}
                    </div>
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Total</span>
                    <strong>₹{order.totalAmount || (order.price && order.quantity ? order.price * order.quantity : '—')}</strong>
                  </div>
                  <div className="order-actions">
                    {canTrackOrder(order) && (
                      <button
                        className="action-btn"
                        onClick={() => navigate('/track-order')}
                      >
                        Track Order
                      </button>
                    )}
                    {canExchange(order) && (
                      <button
                        className="action-btn"
                        onClick={() => navigate(`/account?tab=returns`)}
                      >
                        Return / Exchange
                      </button>
                    )}
                    {!canExchange(order) && order.status?.toLowerCase() === 'delivered' && (
                      <button
                        className="action-btn"
                        onClick={() => navigate(`/account?tab=reviews`)}
                      >
                        Write a Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default YourOrders;
