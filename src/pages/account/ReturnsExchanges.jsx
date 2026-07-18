import { useState, useEffect } from 'react';
import { RotateCcw, Package, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AccountPages.css';

const API = import.meta.env.VITE_API_URL || '/api';

const ReturnsExchanges = () => {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('livn_token');
    try {
      const [ordRes, retRes, exRes] = await Promise.allSettled([
        fetch(`${API}/orders/my`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/returns`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/exchanges`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (ordRes.status === 'fulfilled' && ordRes.value.ok) {
        const d = await ordRes.value.json();
        setOrders(d.data || []);
      }
      if (retRes.status === 'fulfilled' && retRes.value.ok) {
        const d = await retRes.value.json();
        setReturns(d.data || []);
      }
      if (exRes.status === 'fulfilled' && exRes.value.ok) {
        const d = await exRes.value.json();
        setExchanges(d.data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading">Loading…</div>;

  return (
    <div className="account-page">
      <h2 className="account-section-title">Returns & Exchanges</h2>

      {/* Policy banner */}
      <div className="policy-banner">
        <AlertCircle size={16} />
        <span>We offer <strong>30-day easy returns & exchanges</strong> on all orders. No questions asked!</span>
      </div>

      {/* Sub tabs */}
      <div className="sub-tabs">
        {['overview', 'returns', 'exchanges'].map(t => (
          <button
            key={t}
            className={`sub-tab-btn ${activeSubTab === t ? 'active' : ''}`}
            onClick={() => setActiveSubTab(t)}
          >
            {t === 'overview' ? 'My Orders' : t === 'returns' ? `Returns (${returns.length})` : `Exchanges (${exchanges.length})`}
          </button>
        ))}
      </div>

      {/* Overview — list orders user can return */}
      {activeSubTab === 'overview' && (
        orders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No Orders</h3>
            <p>Place an order first to request a return or exchange.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h4>#{order._id?.toString().slice(-8).toUpperCase()}</h4>
                    <p className="order-date">{order.product_name}</p>
                  </div>
                  <span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status || 'Pending'}</span>
                </div>
                <div className="order-footer">
                  <span className="order-date">Qty: {order.quantity || 1} | ₹{order.price || '—'}</span>
                  <div className="order-actions">
                    <button className="action-btn" onClick={() => navigate('/whatsapp')}>
                      <RotateCcw size={13} /> Request Return
                    </button>
                    <button className="action-btn" onClick={() => navigate('/whatsapp')}>
                      <RefreshCw size={13} /> Exchange
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Returns list */}
      {activeSubTab === 'returns' && (
        returns.length === 0 ? (
          <div className="empty-state">
            <RotateCcw size={48} />
            <h3>No Return Requests</h3>
            <p>Go to "My Orders" tab to initiate a return.</p>
          </div>
        ) : (
          <div className="orders-list">
            {returns.map(r => (
              <div key={r._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h4>Return #{r._id?.toString().slice(-8).toUpperCase()}</h4>
                    <p className="order-date">Reason: {r.reason}</p>
                  </div>
                  <span className={`status-badge processing`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Exchanges list */}
      {activeSubTab === 'exchanges' && (
        exchanges.length === 0 ? (
          <div className="empty-state">
            <RefreshCw size={48} />
            <h3>No Exchange Requests</h3>
            <p>Go to "My Orders" tab to initiate an exchange.</p>
          </div>
        ) : (
          <div className="orders-list">
            {exchanges.map(e => (
              <div key={e._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h4>Exchange #{e._id?.toString().slice(-8).toUpperCase()}</h4>
                    <p className="order-date">Reason: {e.reason}</p>
                  </div>
                  <span className={`status-badge processing`}>{e.status}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default ReturnsExchanges;
