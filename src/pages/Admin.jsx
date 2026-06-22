import { useState } from 'react';
import { getOrders, updateOrderStatus, signIn } from '../lib/api';
import { Copy, Check, RefreshCw, LogOut } from 'lucide-react';
import './Admin.css';

const STATUS_OPTIONS = ['New', 'Sent', 'Stitching', 'Ready', 'Delivered'];

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { user } = await signIn(email, password);
      if (user.role !== 'admin') {
        setLoginError('Access denied. Admin account required.');
        return;
      }
      setIsAuthenticated(true);
      fetchOrders();
    } catch (err) {
      setLoginError(err.message || 'Invalid credentials.');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await getOrders();
      if (!error && data) setOrders(data);
    } catch {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const originalOrders = [...orders];
    setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));

    try {
      const { error } = await updateOrderStatus(orderId, newStatus);
      if (error) throw new Error(error);
    } catch {
      alert('Failed to update status');
      setOrders(originalOrders);
    }
  };

  const copyOrderDetails = (order) => {
    const text = `
Order ID: ${order._id.toString().toUpperCase()}
Customer: ${order.customer_name}
Phone: ${order.customer_phone}
Product: ${order.product_name}
Size: ${order.selected_size}
Measurements: ${order.measurements || 'N/A'}
Address: ${order.shipping_address}
Total: Rs. ${order.price}
Status: ${order.status}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(order._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page container">
        <div className="admin-login-card animate-fade-in-up">
          <h1 className="admin-title">Admin Portal</h1>
          <p className="admin-subtitle">Sign in with your admin credentials.</p>
          <form onSubmit={handleLogin} className="admin-form">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-input"
            />
            {loginError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{loginError}</p>}
            <button type="submit" className="btn btn-primary full-width-btn">Enter</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Orders Dashboard</h1>
          <p className="admin-subtitle">Manage all bespoke requests and shipments.</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-outline admin-header-btn" onClick={fetchOrders} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} /> {loading ? 'Syncing...' : 'Sync'}
          </button>
          <button className="btn btn-gold admin-header-btn" onClick={() => setIsAuthenticated(false)}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        {orders.length === 0 && !loading ? (
          <div className="empty-state">
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Info</th>
                  <th>Product Details</th>
                  <th>Measurements</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="animate-fade-in-up">
                    <td className="font-heading text-maroon font-bold">
                      {order._id.toString().slice(-8).toUpperCase()}
                      <div className="order-date">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div className="font-bold">{order.customer_name}</div>
                      <div className="text-secondary">{order.customer_phone}</div>
                      <div className="text-sm border-top-light mt-2 pt-2">{order.shipping_address}</div>
                    </td>
                    <td>
                      <div className="font-bold text-maroon">{order.product_name}</div>
                      <div className="text-secondary">Size: {order.selected_size}</div>
                      <div className="font-bold border-top-light mt-2 pt-2">₹{order.price?.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="measurements-cell">
                      {order.measurements || 'Standard'}
                    </td>
                    <td>
                      <select
                        className={`status-select status-${order.status?.toLowerCase()}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        onClick={() => copyOrderDetails(order)}
                        title="Copy Details"
                      >
                        {copiedId === order._id ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
