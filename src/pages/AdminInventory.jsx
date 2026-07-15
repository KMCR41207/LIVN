import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, History, Plus, Minus, Settings, AlertTriangle, Package } from 'lucide-react';
import { getInventory, getInventorySummary, updateStock, getStockHistory } from '../lib/api';

// ── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    in_stock:     { label: '🟢 In Stock',     cls: 'in_stock' },
    low_stock:    { label: '🟡 Low Stock',    cls: 'low_stock' },
    out_of_stock: { label: '🔴 Out of Stock', cls: 'out_of_stock' },
  };
  const s = map[status] || map.in_stock;
  return <span className={`inv-status-badge ${s.cls}`}>{s.label}</span>;
};

// ── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, variant }) => (
  <div className={`inv-stat-card ${variant || ''}`}>
    <div className="inv-stat-label">{label}</div>
    <div className="inv-stat-value">{value}</div>
  </div>
);

// ── Stock Update Modal ───────────────────────────────────────────────────────
const StockModal = ({ product, onClose, onSaved }) => {
  const [action, setAction] = useState('add');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) { setError('Enter a valid quantity'); return; }
    setLoading(true);
    setError('');
    const { data, error: err } = await updateStock(product._id, action, qty, note);
    setLoading(false);
    if (err) { setError(err); return; }
    onSaved(data);
    onClose();
  };

  const avail = Math.max(0, (product.stock || 0) - (product.reservedStock || 0));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update Stock — {product.name}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '6px', fontSize: '0.88rem' }}>
            <span>Current: <strong>{product.stock || 0}</strong></span>
            <span>·</span>
            <span>Reserved: <strong style={{ color: '#3b82f6' }}>{product.reservedStock || 0}</strong></span>
            <span>·</span>
            <span>Available: <strong style={{ color: '#166534' }}>{avail}</strong></span>
          </div>

          <div className="inv-modal-tabs">
            {['add', 'remove', 'set'].map(a => (
              <button key={a} className={`inv-modal-tab ${action === a ? 'active' : ''}`} onClick={() => { setAction(a); setError(''); }}>
                {a === 'add' ? '+ Add' : a === 'remove' ? '− Remove' : '= Set'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="inv-modal-field">
              <label>{action === 'set' ? 'Set Stock To' : `Quantity to ${action === 'add' ? 'Add' : 'Remove'}`}</label>
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 10" required autoFocus />
            </div>
            <div className="inv-modal-field">
              <label>Note (optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={action === 'add' ? 'e.g. New shipment received' : action === 'remove' ? 'e.g. Damaged items removed' : 'e.g. Manual stock count'} />
            </div>
            {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : '💾 Update Stock'}
              </button>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── History Modal ─────────────────────────────────────────────────────────────
const HistoryModal = ({ productId, productName, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStockHistory(productId).then(({ data }) => {
      if (data) setHistory(data.history || []);
      setLoading(false);
    });
  }, [productId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Stock History — {productName}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading history...</p>
          ) : history.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No stock history yet.</p>
          ) : (
            <table className="inv-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Qty</th>
                  <th>Prev</th>
                  <th>New</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(h.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td><span className={`inv-history-action ${h.action}`}>{h.action}</span></td>
                    <td style={{ fontWeight: 700 }}>{h.quantity}</td>
                    <td>{h.prevStock}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-maroon-dark)' }}>{h.newStock}</td>
                    <td style={{ color: 'var(--color-text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Threshold Modal ───────────────────────────────────────────────────────────
const ThresholdModal = ({ product, onClose, onSaved }) => {
  const [threshold, setThreshold] = useState(product.lowStockThreshold || 10);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const BASE = (import.meta.env.VITE_API_URL || '/api');
    const token = localStorage.getItem('livn_token');
    const res = await fetch(`${BASE}/products/${product._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ lowStockThreshold: parseInt(threshold) }),
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) { onSaved(json.data); onClose(); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Set Threshold — {product.name}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>
          <form onSubmit={handleSave}>
            <div className="inv-modal-field">
              <label>Low Stock Threshold</label>
              <input type="number" min="1" value={threshold} onChange={e => setThreshold(e.target.value)} />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>When available stock drops to or below this number, status changes to 🟡 Low Stock</small>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Threshold'}</button>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Main AdminInventory Component ─────────────────────────────────────────────
const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modals
  const [stockModal, setStockModal] = useState(null);     // product obj
  const [historyModal, setHistoryModal] = useState(null); // { id, name }
  const [thresholdModal, setThresholdModal] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    const [invRes, sumRes] = await Promise.all([getInventory(), getInventorySummary()]);
    if (invRes.error) setError(invRes.error);
    else setProducts(invRes.data || []);
    if (sumRes.data) setSummary(sumRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || p.stockStatus === filterStatus;
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  }), [products, search, filterStatus, filterCategory]);

  const lowStockCount = products.filter(p => p.stockStatus === 'low_stock').length;

  const handleStockSaved = (updated) => {
    setProducts(prev => prev.map(p => p._id === updated._id ? updated : p));
    // Refresh summary
    getInventorySummary().then(({ data }) => { if (data) setSummary(data); });
  };

  const handleThresholdSaved = (updated) => {
    setProducts(prev => prev.map(p => p._id === updated._id ? updated : p));
  };

  return (
    <div className="admin-section">
      {/* Header */}
      <div className="admin-section-header">
        <div>
          <h2>📦 Inventory Management</h2>
          <p>Real-time stock tracking, low stock alerts, and movement history</p>
        </div>
        <button className="btn btn-outline" onClick={fetchData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Low stock alert banner */}
      {lowStockCount > 0 && (
        <div className="inv-low-stock-alert">
          <AlertTriangle size={18} />
          <strong>{lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low on stock.</strong>
          Filter by "Low Stock" to view them.
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="inventory-summary-grid">
          <SummaryCard label="Total Products" value={summary.totalProducts} />
          <SummaryCard label="Total Stock Units" value={summary.totalStock.toLocaleString('en-IN')} />
          <SummaryCard label="Low Stock" value={summary.lowStockCount} variant="warning" />
          <SummaryCard label="Out of Stock" value={summary.outOfStockCount} variant="danger" />
          <SummaryCard label="Reserved Units" value={summary.reservedStock} variant="info" />
          <SummaryCard label="Inventory Value" value={`₹${summary.totalValue.toLocaleString('en-IN')}`} />
        </div>
      )}

      {/* Filter Bar */}
      <div className="inv-filter-bar">
        <input
          className="inv-search"
          type="text"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="inv-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="in_stock">🟢 In Stock</option>
          <option value="low_stock">🟡 Low Stock</option>
          <option value="out_of_stock">🔴 Out of Stock</option>
        </select>
        <select className="inv-filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading && products.length === 0 ? (
        <div className="empty-state"><p>Loading inventory...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Package size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>{products.length === 0 ? 'No products found. Add products from the Products tab.' : 'No products match your filters.'}</p>
        </div>
      ) : (
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => {
                const avail = Math.max(0, (product.stock || 0) - (product.reservedStock || 0));
                return (
                  <tr key={product._id} style={product.stockStatus === 'low_stock' ? { background: '#fffbeb' } : product.stockStatus === 'out_of_stock' ? { background: '#fff5f5' } : {}}>
                    <td>
                      {product.image
                        ? <img src={product.image} alt={product.name} className="inv-product-img" />
                        : <div style={{ width: 42, height: 42, background: 'var(--color-bg-secondary)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👗</div>
                      }
                    </td>
                    <td>
                      <div className="inv-product-name">{product.name}</div>
                    </td>
                    <td><span className="inv-sku">{product.sku || '—'}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{product.category}</td>
                    <td><span className="inv-stock-num">{product.stock || 0}</span></td>
                    <td><span className="inv-reserved-num">{product.reservedStock || 0}</span></td>
                    <td><span className="inv-available-num">{avail}</span></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{product.lowStockThreshold || 10}</td>
                    <td><StatusBadge status={product.stockStatus} /></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {product.lastStockUpdate
                        ? new Date(product.lastStockUpdate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                        : '—'}
                    </td>
                    <td>
                      <div className="inv-action-btns">
                        <button className="inv-btn inv-btn-add" title="Add stock" onClick={() => setStockModal({ ...product, _defaultAction: 'add' })}>
                          <Plus size={14} />
                        </button>
                        <button className="inv-btn inv-btn-remove" title="Remove stock" onClick={() => setStockModal({ ...product, _defaultAction: 'remove' })}>
                          <Minus size={14} />
                        </button>
                        <button className="inv-btn inv-btn-history" title="Stock history" onClick={() => setHistoryModal({ id: product._id, name: product.name })}>
                          <History size={14} />
                        </button>
                        <button className="inv-btn inv-btn-history" title="Set threshold" onClick={() => setThresholdModal(product)}>
                          <Settings size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Update Modal */}
      {stockModal && (
        <StockModal
          product={stockModal}
          onClose={() => setStockModal(null)}
          onSaved={handleStockSaved}
        />
      )}

      {/* History Modal */}
      {historyModal && (
        <HistoryModal
          productId={historyModal.id}
          productName={historyModal.name}
          onClose={() => setHistoryModal(null)}
        />
      )}

      {/* Threshold Modal */}
      {thresholdModal && (
        <ThresholdModal
          product={thresholdModal}
          onClose={() => setThresholdModal(null)}
          onSaved={handleThresholdSaved}
        />
      )}
    </div>
  );
};

export default AdminInventory;
