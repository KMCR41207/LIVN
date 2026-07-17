import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMyOrders, getReturns, getExchanges, getCancellations, createReturn, createExchange, createCancellation, updateReturn, updateExchange, updateCancellation } from '../lib/api';
import { LogOut, Package, RefreshCw, Zap, X, Send, AlertCircle, Check, Clock } from 'lucide-react';
import './CustomerAccount.css';

const RETURN_REASONS = ['Wrong Size', 'Damaged Product', 'Wrong Item Received', 'Quality Issue', 'Changed Mind', 'Other'];
const EXCHANGE_REASONS = ['Wrong Size', 'Wrong Color', 'Defective', 'Changed Mind', 'Other'];
const CANCELLATION_REASONS = ['Changed Mind', 'Found Better Price', 'Ordered by Mistake', 'Delivery Too Slow', 'Payment Issue', 'Other'];

const STATUS_COLORS = {
  'Return Requested': '#3b82f6',
  'Under Review': '#f59e0b',
  'Approved': '#10b981',
  'Rejected': '#ef4444',
  'Pickup Scheduled': '#8b5cf6',
  'Received': '#06b6d4',
  'Refund Initiated': '#ec4899',
  'Completed': '#6366f1',
  'Requested': '#3b82f6',
  'More Info Requested': '#f59e0b',
  'Exchange Requested': '#3b82f6',
  'Review': '#f59e0b',
  'Replacement Stitching': '#8b5cf6',
  'Dispatched': '#06b6d4',
};

const CustomerAccount = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Returns state
  const [returns, setReturns] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [returnFormData, setReturnFormData] = useState({ reason: '', comments: '' });

  // Exchanges state
  const [exchanges, setExchanges] = useState([]);
  const [exchangesLoading, setExchangesLoading] = useState(false);
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [selectedOrderForExchange, setSelectedOrderForExchange] = useState(null);
  const [exchangeFormData, setExchangeFormData] = useState({ reason: '', newSize: '', comments: '' });

  // Cancellations state
  const [cancellations, setCancellations] = useState([]);
  const [cancellationsLoading, setCancellationsLoading] = useState(false);
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const [selectedOrderForCancellation, setSelectedOrderForCancellation] = useState(null);
  const [cancellationFormData, setCancellationFormData] = useState({ reason: '', comments: '' });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check auth on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Fetch data based on active tab
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'returns') fetchReturns();
    if (activeTab === 'exchanges') fetchExchanges();
    if (activeTab === 'cancellations') fetchCancellations();
  }, [activeTab, isAuthenticated]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await getMyOrders();
      if (error) throw new Error(error);
      setOrders(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchReturns = async () => {
    setReturnsLoading(true);
    try {
      const { data, error } = await getReturns();
      if (error) throw new Error(error);
      // Filter to only current user's returns
      const userReturns = data?.filter(r => r.customerEmail === currentUser?.email) || [];
      setReturns(userReturns);
    } catch (err) {
      setError(err.message || 'Failed to load returns');
    } finally {
      setReturnsLoading(false);
    }
  };

  const fetchExchanges = async () => {
    setExchangesLoading(true);
    try {
      const { data, error } = await getExchanges();
      if (error) throw new Error(error);
      // Filter to only current user's exchanges
      const userExchanges = data?.filter(e => e.customerEmail === currentUser?.email) || [];
      setExchanges(userExchanges);
    } catch (err) {
      setError(err.message || 'Failed to load exchanges');
    } finally {
      setExchangesLoading(false);
    }
  };

  const fetchCancellations = async () => {
    setCancellationsLoading(true);
    try {
      const { data, error } = await getCancellations();
      if (error) throw new Error(error);
      // Filter to only current user's cancellations
      const userCancellations = data?.filter(c => c.customerEmail === currentUser?.email) || [];
      setCancellations(userCancellations);
    } catch (err) {
      setError(err.message || 'Failed to load cancellations');
    } finally {
      setCancellationsLoading(false);
    }
  };

  const handleCreateReturn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedOrderForReturn) {
      setError('Please select an order');
      return;
    }

    if (!returnFormData.reason) {
      setError('Please select a reason');
      return;
    }

    try {
      const returnData = {
        orderId: selectedOrderForReturn._id,
        orderRef: selectedOrderForReturn._id.slice(-6),
        customerName: currentUser?.email?.split('@')[0] || 'Customer',
        customerEmail: currentUser?.email,
        customerPhone: '',
        productName: selectedOrderForReturn.product_name,
        productId: selectedOrderForReturn.product_id,
        quantity: selectedOrderForReturn.quantity || 1,
        reason: returnFormData.reason,
        comments: returnFormData.comments,
        status: 'Return Requested',
      };

      const { data, error } = await createReturn(returnData);
      if (error) throw new Error(error);

      setSuccess('Return request created successfully!');
      setShowReturnForm(false);
      setReturnFormData({ reason: '', comments: '' });
      fetchReturns();
    } catch (err) {
      setError(err.message || 'Failed to create return request');
    }
  };

  const handleCreateExchange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedOrderForExchange) {
      setError('Please select an order');
      return;
    }

    if (!exchangeFormData.reason) {
      setError('Please select a reason');
      return;
    }

    try {
      const exchangeData = {
        orderId: selectedOrderForExchange._id,
        orderRef: selectedOrderForExchange._id.slice(-6),
        customerName: currentUser?.email?.split('@')[0] || 'Customer',
        customerEmail: currentUser?.email,
        customerPhone: '',
        productName: selectedOrderForExchange.product_name,
        productId: selectedOrderForExchange.product_id,
        originalSize: selectedOrderForExchange.selected_size || 'Standard',
        newSize: exchangeFormData.newSize || selectedOrderForExchange.selected_size,
        reason: exchangeFormData.reason,
        comments: exchangeFormData.comments,
        status: 'Exchange Requested',
      };

      const { data, error } = await createExchange(exchangeData);
      if (error) throw new Error(error);

      setSuccess('Exchange request created successfully!');
      setShowExchangeForm(false);
      setExchangeFormData({ reason: '', newSize: '', comments: '' });
      fetchExchanges();
    } catch (err) {
      setError(err.message || 'Failed to create exchange request');
    }
  };

  const handleCreateCancellation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedOrderForCancellation) {
      setError('Please select an order');
      return;
    }

    if (!cancellationFormData.reason) {
      setError('Please select a reason');
      return;
    }

    try {
      const cancellationData = {
        orderId: selectedOrderForCancellation._id,
        orderRef: selectedOrderForCancellation._id.slice(-6),
        customerName: currentUser?.email?.split('@')[0] || 'Customer',
        customerEmail: currentUser?.email,
        customerPhone: '',
        productName: selectedOrderForCancellation.product_name,
        productId: selectedOrderForCancellation.product_id,
        orderAmount: (selectedOrderForCancellation.price || 0) * (selectedOrderForCancellation.quantity || 1),
        orderStatus: selectedOrderForCancellation.status,
        reason: cancellationFormData.reason,
        comments: cancellationFormData.comments,
        status: 'Requested',
        refundAmount: (selectedOrderForCancellation.price || 0) * (selectedOrderForCancellation.quantity || 1),
      };

      const { data, error } = await createCancellation(cancellationData);
      if (error) throw new Error(error);

      setSuccess('Cancellation request created successfully!');
      setShowCancellationForm(false);
      setCancellationFormData({ reason: '', comments: '' });
      fetchCancellations();
    } catch (err) {
      setError(err.message || 'Failed to create cancellation request');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusIcon = (status) => {
    if (status === 'Completed' || status === 'Approved') return <Check size={16} />;
    if (status === 'Rejected') return <X size={16} />;
    return <Clock size={16} />;
  };

  return (
    <div className="customer-account-page">
      <div className="customer-account-container">
        {/* Header */}
        <div className="account-header">
          <div className="account-header-content">
            <h1>My Account</h1>
            <p className="account-email">{currentUser?.email}</p>
          </div>
          <button className="btn btn-gold logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            {error}
            <button onClick={() => setError('')} className="alert-close">
              <X size={16} />
            </button>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <Check size={18} />
            {success}
            <button onClick={() => setSuccess('')} className="alert-close">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="account-tabs">
          <button className={`account-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            📦 Orders
          </button>
          <button className={`account-tab ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')}>
            ↩️ Returns
          </button>
          <button className={`account-tab ${activeTab === 'exchanges' ? 'active' : ''}`} onClick={() => setActiveTab('exchanges')}>
            🔄 Exchanges
          </button>
          <button className={`account-tab ${activeTab === 'cancellations' ? 'active' : ''}`} onClick={() => setActiveTab('cancellations')}>
            ✕ Cancellations
          </button>
        </div>

        {/* Content */}
        <div className="account-content">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="tab-section">
              <h2>My Orders</h2>
              {ordersLoading ? (
                <div className="loading">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <Package size={48} />
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="orders-grid">
                  {orders.map(order => (
                    <div key={order._id} className="order-card">
                      <div className="order-card-header">
                        <h3>{order.product_name}</h3>
                        <span className="order-status" style={{ color: STATUS_COLORS[order.status] || '#666' }}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-card-body">
                        <p><strong>Order ID:</strong> {order._id?.slice(-6)}</p>
                        <p><strong>Quantity:</strong> {order.quantity || 1}</p>
                        <p><strong>Price:</strong> ₹{order.price || 0}</p>
                        <p><strong>Total:</strong> ₹{((order.price || 0) * (order.quantity || 1)).toFixed(2)}</p>
                        <p><strong>Size:</strong> {order.selected_size || 'Standard'}</p>
                        <p className="order-date"><strong>Ordered:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Returns Tab */}
          {activeTab === 'returns' && (
            <div className="tab-section">
              <div className="tab-header">
                <h2>My Returns</h2>
                <button className="btn btn-maroon" onClick={() => setShowReturnForm(!showReturnForm)}>
                  <RefreshCw size={16} /> New Return Request
                </button>
              </div>

              {showReturnForm && (
                <div className="request-form return-form">
                  <h3>Request Return</h3>
                  <form onSubmit={handleCreateReturn}>
                    <div className="form-group">
                      <label>Select Order *</label>
                      <select
                        value={selectedOrderForReturn?._id || ''}
                        onChange={(e) => setSelectedOrderForReturn(orders.find(o => o._id === e.target.value))}
                        required
                      >
                        <option value="">-- Select an order --</option>
                        {orders.map(order => (
                          <option key={order._id} value={order._id}>
                            {order.product_name} - {order.status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Reason *</label>
                      <select
                        value={returnFormData.reason}
                        onChange={(e) => setReturnFormData({ ...returnFormData, reason: e.target.value })}
                        required
                      >
                        <option value="">-- Select reason --</option>
                        {RETURN_REASONS.map(reason => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Additional Comments</label>
                      <textarea
                        value={returnFormData.comments}
                        onChange={(e) => setReturnFormData({ ...returnFormData, comments: e.target.value })}
                        placeholder="Tell us more about your return request..."
                        rows={4}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-maroon">
                        <Send size={16} /> Submit Return Request
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowReturnForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {returnsLoading ? (
                <div className="loading">Loading returns...</div>
              ) : returns.length === 0 ? (
                <div className="empty-state">
                  <RefreshCw size={48} />
                  <p>No return requests yet</p>
                </div>
              ) : (
                <div className="requests-list">
                  {returns.map(ret => (
                    <div key={ret._id} className="request-card">
                      <div className="request-header">
                        <h3>{ret.productName}</h3>
                        <span className="status-badge" style={{ backgroundColor: STATUS_COLORS[ret.status] || '#999' }}>
                          {getStatusIcon(ret.status)} {ret.status}
                        </span>
                      </div>
                      <div className="request-body">
                        <p><strong>Reason:</strong> {ret.reason}</p>
                        <p><strong>Quantity:</strong> {ret.quantity || 1}</p>
                        {ret.refundAmount && <p><strong>Refund Amount:</strong> ₹{ret.refundAmount.toFixed(2)}</p>}
                        {ret.comments && <p><strong>Comments:</strong> {ret.comments}</p>}
                        {ret.adminNote && <p><strong>Admin Note:</strong> {ret.adminNote}</p>}
                        <p className="request-date">Requested: {new Date(ret.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Exchanges Tab */}
          {activeTab === 'exchanges' && (
            <div className="tab-section">
              <div className="tab-header">
                <h2>My Exchanges</h2>
                <button className="btn btn-maroon" onClick={() => setShowExchangeForm(!showExchangeForm)}>
                  <Zap size={16} /> New Exchange Request
                </button>
              </div>

              {showExchangeForm && (
                <div className="request-form exchange-form">
                  <h3>Request Exchange</h3>
                  <form onSubmit={handleCreateExchange}>
                    <div className="form-group">
                      <label>Select Order *</label>
                      <select
                        value={selectedOrderForExchange?._id || ''}
                        onChange={(e) => setSelectedOrderForExchange(orders.find(o => o._id === e.target.value))}
                        required
                      >
                        <option value="">-- Select an order --</option>
                        {orders.map(order => (
                          <option key={order._id} value={order._id}>
                            {order.product_name} - {order.selected_size || 'Standard'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Reason *</label>
                      <select
                        value={exchangeFormData.reason}
                        onChange={(e) => setExchangeFormData({ ...exchangeFormData, reason: e.target.value })}
                        required
                      >
                        <option value="">-- Select reason --</option>
                        {EXCHANGE_REASONS.map(reason => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>New Size</label>
                      <select
                        value={exchangeFormData.newSize}
                        onChange={(e) => setExchangeFormData({ ...exchangeFormData, newSize: e.target.value })}
                      >
                        <option value="">-- Select size --</option>
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Standard'].map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Additional Comments</label>
                      <textarea
                        value={exchangeFormData.comments}
                        onChange={(e) => setExchangeFormData({ ...exchangeFormData, comments: e.target.value })}
                        placeholder="Tell us more about your exchange request..."
                        rows={4}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-maroon">
                        <Send size={16} /> Submit Exchange Request
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowExchangeForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {exchangesLoading ? (
                <div className="loading">Loading exchanges...</div>
              ) : exchanges.length === 0 ? (
                <div className="empty-state">
                  <Zap size={48} />
                  <p>No exchange requests yet</p>
                </div>
              ) : (
                <div className="requests-list">
                  {exchanges.map(exc => (
                    <div key={exc._id} className="request-card">
                      <div className="request-header">
                        <h3>{exc.productName}</h3>
                        <span className="status-badge" style={{ backgroundColor: STATUS_COLORS[exc.status] || '#999' }}>
                          {getStatusIcon(exc.status)} {exc.status}
                        </span>
                      </div>
                      <div className="request-body">
                        <p><strong>Original Size:</strong> {exc.originalSize}</p>
                        <p><strong>New Size:</strong> {exc.newSize}</p>
                        <p><strong>Reason:</strong> {exc.reason}</p>
                        {exc.comments && <p><strong>Comments:</strong> {exc.comments}</p>}
                        {exc.adminNote && <p><strong>Admin Note:</strong> {exc.adminNote}</p>}
                        <p className="request-date">Requested: {new Date(exc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cancellations Tab */}
          {activeTab === 'cancellations' && (
            <div className="tab-section">
              <div className="tab-header">
                <h2>My Cancellations</h2>
                <button className="btn btn-maroon" onClick={() => setShowCancellationForm(!showCancellationForm)}>
                  <X size={16} /> New Cancellation Request
                </button>
              </div>

              {showCancellationForm && (
                <div className="request-form cancellation-form">
                  <h3>Request Cancellation</h3>
                  <form onSubmit={handleCreateCancellation}>
                    <div className="form-group">
                      <label>Select Order *</label>
                      <select
                        value={selectedOrderForCancellation?._id || ''}
                        onChange={(e) => setSelectedOrderForCancellation(orders.find(o => o._id === e.target.value))}
                        required
                      >
                        <option value="">-- Select an order --</option>
                        {orders.map(order => (
                          <option key={order._id} value={order._id}>
                            {order.product_name} - {order.status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Reason *</label>
                      <select
                        value={cancellationFormData.reason}
                        onChange={(e) => setCancellationFormData({ ...cancellationFormData, reason: e.target.value })}
                        required
                      >
                        <option value="">-- Select reason --</option>
                        {CANCELLATION_REASONS.map(reason => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Additional Comments</label>
                      <textarea
                        value={cancellationFormData.comments}
                        onChange={(e) => setCancellationFormData({ ...cancellationFormData, comments: e.target.value })}
                        placeholder="Tell us more about your cancellation request..."
                        rows={4}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-maroon">
                        <Send size={16} /> Submit Cancellation Request
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowCancellationForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {cancellationsLoading ? (
                <div className="loading">Loading cancellations...</div>
              ) : cancellations.length === 0 ? (
                <div className="empty-state">
                  <X size={48} />
                  <p>No cancellation requests yet</p>
                </div>
              ) : (
                <div className="requests-list">
                  {cancellations.map(canc => (
                    <div key={canc._id} className="request-card">
                      <div className="request-header">
                        <h3>{canc.productName}</h3>
                        <span className="status-badge" style={{ backgroundColor: STATUS_COLORS[canc.status] || '#999' }}>
                          {getStatusIcon(canc.status)} {canc.status}
                        </span>
                      </div>
                      <div className="request-body">
                        <p><strong>Reason:</strong> {canc.reason}</p>
                        <p><strong>Order Amount:</strong> ₹{canc.orderAmount?.toFixed(2) || '0'}</p>
                        {canc.refundAmount && <p><strong>Refund Amount:</strong> ₹{canc.refundAmount.toFixed(2)}</p>}
                        {canc.ineligibleReason && (
                          <p className="ineligible-reason"><AlertCircle size={14} /> {canc.ineligibleReason}</p>
                        )}
                        {canc.comments && <p><strong>Comments:</strong> {canc.comments}</p>}
                        {canc.adminNote && <p><strong>Admin Note:</strong> {canc.adminNote}</p>}
                        <p className="request-date">Requested: {new Date(canc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAccount;
