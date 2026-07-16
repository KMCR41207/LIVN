import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2, Pencil, Eye, Check, X, Download, AlertCircle } from 'lucide-react';
import { getInvoices, getReturns, getExchanges, getCancellations, getPurchaseOrders, getBusinessKPIs, updateReturn, updateExchange, updateCancellation, updatePurchaseOrder, deleteReturn, deleteExchange, deleteCancellation, deletePurchaseOrder } from '../lib/api';
import './AdminBusiness.css';

const AdminBusiness = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Dashboard KPIs
  const [kpis, setKpis] = useState(null);

  // Lists
  const [invoices, setInvoices] = useState([]);
  const [returns, setReturns] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [cancellations, setCancellations] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  useEffect(() => {
    if (activeTab === 'dashboard') fetchKPIs();
    else if (activeTab === 'invoices') fetchInvoices();
    else if (activeTab === 'returns') fetchReturns();
    else if (activeTab === 'exchanges') fetchExchanges();
    else if (activeTab === 'cancellations') fetchCancellations();
    else if (activeTab === 'purchase-orders') fetchPurchaseOrders();
  }, [activeTab]);

  const fetchKPIs = async () => {
    setLoading(true);
    const { data } = await getBusinessKPIs();
    if (data) setKpis(data);
    setLoading(false);
  };

  const fetchInvoices = async () => {
    setLoading(true);
    const { data } = await getInvoices();
    if (data) setInvoices(data);
    setLoading(false);
  };

  const fetchReturns = async () => {
    setLoading(true);
    const { data } = await getReturns();
    if (data) setReturns(data);
    setLoading(false);
  };

  const fetchExchanges = async () => {
    setLoading(true);
    const { data } = await getExchanges();
    if (data) setExchanges(data);
    setLoading(false);
  };

  const fetchCancellations = async () => {
    setLoading(true);
    const { data } = await getCancellations();
    if (data) setCancellations(data);
    setLoading(false);
  };

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    const { data } = await getPurchaseOrders();
    if (data) setPurchaseOrders(data);
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus, type) => {
    try {
      let result;
      if (type === 'return') result = await updateReturn(id, { status: newStatus });
      else if (type === 'exchange') result = await updateExchange(id, { status: newStatus });
      else if (type === 'cancellation') result = await updateCancellation(id, { status: newStatus });
      else if (type === 'po') result = await updatePurchaseOrder(id, { status: newStatus });

      if (!result.error) {
        if (type === 'return') setReturns(prev => prev.map(r => r._id === id ? result.data : r));
        else if (type === 'exchange') setExchanges(prev => prev.map(e => e._id === id ? result.data : e));
        else if (type === 'cancellation') setCancellations(prev => prev.map(c => c._id === id ? result.data : c));
        else if (type === 'po') setPurchaseOrders(prev => prev.map(p => p._id === id ? result.data : p));
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      let result;
      if (type === 'return') result = await deleteReturn(id);
      else if (type === 'exchange') result = await deleteExchange(id);
      else if (type === 'cancellation') result = await deleteCancellation(id);
      else if (type === 'po') result = await deletePurchaseOrder(id);

      if (!result.error) {
        if (type === 'return') setReturns(prev => prev.filter(r => r._id !== id));
        else if (type === 'exchange') setExchanges(prev => prev.filter(e => e._id !== id));
        else if (type === 'cancellation') setCancellations(prev => prev.filter(c => c._id !== id));
        else if (type === 'po') setPurchaseOrders(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  return (
    <div className="admin-section">
      {/* Nav Tabs */}
      <div className="business-nav-tabs">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          📊 Dashboard
        </button>
        <button className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>
          🧾 GST Invoices
        </button>
        <button className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')}>
          ↩️ Returns
        </button>
        <button className={`tab-btn ${activeTab === 'exchanges' ? 'active' : ''}`} onClick={() => setActiveTab('exchanges')}>
          🔄 Exchanges
        </button>
        <button className={`tab-btn ${activeTab === 'cancellations' ? 'active' : ''}`} onClick={() => setActiveTab('cancellations')}>
          ❌ Cancellations
        </button>
        <button className={`tab-btn ${activeTab === 'purchase-orders' ? 'active' : ''}`} onClick={() => setActiveTab('purchase-orders')}>
          📦 Purchase Orders
        </button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h2>🏢 Business Dashboard</h2>
              <p>Key performance indicators and business metrics</p>
            </div>
            <button className="btn btn-outline" onClick={fetchKPIs} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {kpis && (
            <div className="kpi-grid">
              <div className="kpi-card">
                <label>Total Sales</label>
                <p className="kpi-value">₹{kpis.totalSales?.toLocaleString('en-IN') || 0}</p>
              </div>
              <div className="kpi-card">
                <label>Total Returns</label>
                <p className="kpi-value">{kpis.totalReturns || 0}</p>
              </div>
              <div className="kpi-card">
                <label>Total Exchanges</label>
                <p className="kpi-value">{kpis.totalExchanges || 0}</p>
              </div>
              <div className="kpi-card">
                <label>Cancelled Orders</label>
                <p className="kpi-value">{kpis.cancelledOrders || 0}</p>
              </div>
              <div className="kpi-card">
                <label>Pending Refunds</label>
                <p className="kpi-value">{kpis.pendingRefunds || 0}</p>
              </div>
              <div className="kpi-card">
                <label>Active POs</label>
                <p className="kpi-value">{kpis.activePOs || 0}</p>
              </div>
              <div className="kpi-card">
                <label>Inventory Value</label>
                <p className="kpi-value">₹{kpis.inventoryValue?.toLocaleString('en-IN') || 0}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* INVOICES TAB */}
      {activeTab === 'invoices' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h2>🧾 GST Invoices</h2>
              <p>Manage customer invoices</p>
            </div>
            <button className="btn btn-outline" onClick={fetchInvoices} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="empty-state"><p>No invoices yet.</p></div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv._id}>
                      <td><strong>{inv.invoiceNumber}</strong></td>
                      <td>{inv.orderId?.toString().slice(-8) || '—'}</td>
                      <td>{inv.customerName}</td>
                      <td>₹{inv.grandTotal?.toLocaleString('en-IN')}</td>
                      <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td><span className="status-badge">{inv.status}</span></td>
                      <td>
                        <button className="action-btn" title="View">
                          <Eye size={14} />
                        </button>
                        <button className="action-btn" title="Download PDF">
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RETURNS TAB */}
      {activeTab === 'returns' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h2>↩️ Return Requests</h2>
              <p>Manage customer returns</p>
            </div>
            <button className="btn btn-outline" onClick={fetchReturns} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {returns.length === 0 ? (
            <div className="empty-state"><p>No return requests.</p></div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Refund</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map(ret => (
                    <tr key={ret._id}>
                      <td><strong>#{ret.orderRef}</strong></td>
                      <td>{ret.customerName}</td>
                      <td>{ret.productName}</td>
                      <td><small>{ret.reason}</small></td>
                      <td>
                        <select value={ret.status} onChange={(e) => handleStatusChange(ret._id, e.target.value, 'return')} className="status-select">
                          <option value="Return Requested">Return Requested</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Pickup Scheduled">Pickup Scheduled</option>
                          <option value="Received">Received</option>
                          <option value="Refund Initiated">Refund Initiated</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td>₹{ret.refundAmount || 0}</td>
                      <td>
                        <button className="action-btn" title="Delete" onClick={() => handleDelete(ret._id, 'return')}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EXCHANGES TAB */}
      {activeTab === 'exchanges' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h2>🔄 Exchange Requests</h2>
              <p>Manage customer exchanges</p>
            </div>
            <button className="btn btn-outline" onClick={fetchExchanges} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {exchanges.length === 0 ? (
            <div className="empty-state"><p>No exchange requests.</p></div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Exchange Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exchanges.map(exch => (
                    <tr key={exch._id}>
                      <td><strong>#{exch.orderRef}</strong></td>
                      <td>{exch.customerName}</td>
                      <td>{exch.productName}</td>
                      <td><small>{exch.exchangeType}</small></td>
                      <td>
                        <select value={exch.status} onChange={(e) => handleStatusChange(exch._id, e.target.value, 'exchange')} className="status-select">
                          <option value="Exchange Requested">Exchange Requested</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Pickup Scheduled">Pickup Scheduled</option>
                          <option value="Replacement Stitching">Replacement Stitching</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        <button className="action-btn" title="Delete" onClick={() => handleDelete(exch._id, 'exchange')}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CANCELLATIONS TAB */}
      {activeTab === 'cancellations' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h2>❌ Cancellation Requests</h2>
              <p>Manage order cancellations</p>
            </div>
            <button className="btn btn-outline" onClick={fetchCancellations} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {cancellations.length === 0 ? (
            <div className="empty-state"><p>No cancellation requests.</p></div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Eligible</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cancellations.map(canc => (
                    <tr key={canc._id}>
                      <td><strong>#{canc.orderRef}</strong></td>
                      <td>{canc.customerName}</td>
                      <td>{canc.productName}</td>
                      <td>₹{canc.orderAmount || 0}</td>
                      <td>
                        <select value={canc.status} onChange={(e) => handleStatusChange(canc._id, e.target.value, 'cancellation')} className="status-select">
                          <option value="Requested">Requested</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Refund Processing">Refund Processing</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        {canc.isEligible ? <Check size={16} style={{ color: '#2e7d32' }} /> : <AlertCircle size={16} style={{ color: '#d32f2f' }} />}
                      </td>
                      <td>
                        <button className="action-btn" title="Delete" onClick={() => handleDelete(canc._id, 'cancellation')}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PURCHASE ORDERS TAB */}
      {activeTab === 'purchase-orders' && (
        <div>
          <div className="admin-section-header">
            <div>
              <h2>📦 Purchase Orders</h2>
              <p>Manage supplier orders</p>
            </div>
            <button className="btn btn-outline" onClick={fetchPurchaseOrders} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {purchaseOrders.length === 0 ? (
            <div className="empty-state"><p>No purchase orders.</p></div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PO #</th>
                    <th>Supplier</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Expected Delivery</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map(po => (
                    <tr key={po._id}>
                      <td><strong>{po.poNumber}</strong></td>
                      <td>{po.supplierName}</td>
                      <td>{po.items.length} items</td>
                      <td>₹{po.totalAmount?.toLocaleString('en-IN')}</td>
                      <td>{po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : '—'}</td>
                      <td>
                        <select value={po.status} onChange={(e) => handleStatusChange(po._id, e.target.value, 'po')} className="status-select">
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Partially Received">Partially Received</option>
                          <option value="Received">Received</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td><small>{po.paymentStatus}</small></td>
                      <td>
                        <button className="action-btn" title="Delete" onClick={() => handleDelete(po._id, 'po')}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBusiness;
