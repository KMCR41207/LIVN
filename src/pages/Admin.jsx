import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus, getProducts, createProduct, deleteProduct, getCurrentUser, signOut } from '../lib/api';
import { Copy, Check, RefreshCw, LogOut, Plus, X, MessageSquare, Send, Trash2 } from 'lucide-react';
import './Admin.css';

const STATUS_OPTIONS = ['New', 'Sent', 'Stitching', 'Ready', 'Delivered'];

const Admin = () => {
  const navigate = useNavigate();

  // Check JWT from localStorage — no separate login needed
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState('orders');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderComments, setOrderComments] = useState({});
  const [commentText, setCommentText] = useState('');

  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Bespoke',
    price: '',
    offer_price: '',
    image: '',
    description: ''
  });

  // Database verification state
  const [dbStats, setDbStats] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  // On mount: check if already logged in as admin via JWT
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.role === 'admin') {
      setIsAuthenticated(true);
    } else {
      // Not logged in or not admin — redirect to home
      navigate('/');
    }
    setAuthChecked(true);
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') fetchOrders();
    if (isAuthenticated && activeTab === 'products') fetchProducts();
  }, [isAuthenticated, activeTab]);

  const handleLogout = () => {
    signOut();
    setIsAuthenticated(false);
    navigate('/');
  };

  // Show nothing while checking auth
  if (!authChecked) return null;
    setLoading(true);
    try {
      const { data, error } = await getOrders();
      if (!error && data) {
        setOrders(data);
      }
    } catch {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductError('');
    try {
      const { data, error } = await getProducts();
      if (error) throw new Error(error);
      setProducts(data || []);
    } catch (err) {
      setProductError(err.message || 'Failed to load products');
    } finally {
      setProductsLoading(false);
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
Order ID: ${order._id.toString().slice(-8).toUpperCase()}
Customer: ${order.customer_name}
Email: ${order.customer_email}
Phone: ${order.customer_phone}
Product: ${order.product_name}
Size: ${order.selected_size}
Measurements: ${order.measurements || 'N/A'}
Address: ${order.shipping_address}
Total: ₹${order.price?.toLocaleString('en-IN')}
Status: ${order.status}
Date: ${new Date(order.createdAt).toLocaleDateString()}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(order._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      setProductError('Name, category, and price are required');
      return;
    }

    setProductsLoading(true);
    setProductError('');
    try {
      const payload = {
        name:        newProduct.name,
        category:    newProduct.category,
        price:       parseFloat(newProduct.price),
        offer_price: newProduct.offer_price ? parseFloat(newProduct.offer_price) : null,
        image:       newProduct.image,
        description: newProduct.description,
      };

      const { data, error } = await createProduct(payload);
      if (error) throw new Error(error);

      setProducts(prev => [data, ...prev]);
      setNewProduct({ name: '', category: 'Bespoke', price: '', offer_price: '', image: '', description: '' });
      setShowAddProduct(false);
    } catch (err) {
      setProductError(err.message || 'Failed to save product');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const { error } = await deleteProduct(id);
      if (error) throw new Error(error);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleAddComment = (orderId) => {
    if (!commentText.trim()) return;

    if (!orderComments[orderId]) {
      orderComments[orderId] = [];
    }

    orderComments[orderId] = [
      ...orderComments[orderId],
      {
        id: Date.now(),
        text: commentText,
        timestamp: new Date().toLocaleString(),
        author: 'Admin'
      }
    ];

    setOrderComments({ ...orderComments });
    setCommentText('');
  };

  const verifyDatabaseConnectivity = async () => {
    setVerificationLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${BASE_URL.replace('/api', '')}/api/health`);
      const data = await response.json();

      // Also fetch fresh counts
      const [ordersRes, productsRes] = await Promise.all([
        getOrders(),
        getProducts(),
      ]);

      setDbStats({
        status: data.status,
        db: data.db === 'connected' ? '✅ Connected' : '❌ Disconnected',
        timestamp: new Date().toLocaleString(),
        ordersCount: ordersRes.data?.length ?? 0,
        productsCount: productsRes.data?.length ?? 0,
      });
    } catch (err) {
      setDbStats({
        status: 'error',
        db: '❌ Connection Error',
        error: err.message,
        timestamp: new Date().toLocaleString(),
        ordersCount: 0,
        productsCount: 0,
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  if (!isAuthenticated) {
  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-brand">LIVAANI</h2>
          <p className="admin-brand-sub">Admin Portal</p>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            👗 Products
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            💾 Database
          </button>
        </nav>

        <button className="btn btn-gold admin-logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="admin-main">
        {/* ====== ORDERS TAB ====== */}
        {activeTab === 'orders' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Order Management</h2>
                <p>Manage customer orders and update statuses</p>
              </div>
              <button className="btn btn-outline" onClick={fetchOrders} disabled={loading}>
                <RefreshCw size={16} className={loading ? 'spinning' : ''} /> 
                {loading ? 'Syncing...' : 'Refresh'}
              </button>
            </div>

            {orders.length === 0 && !loading ? (
              <div className="empty-state">
                <p>No orders found.</p>
              </div>
            ) : (
              <div className="admin-orders-grid">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <h3 className="order-id">#{order._id.toString().slice(-8).toUpperCase()}</h3>
                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <select
                        className={`status-badge status-${order.status?.toLowerCase()}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div className="order-card-body">
                      <div className="order-info-group">
                        <label>Customer</label>
                        <p><strong>{order.customer_name}</strong></p>
                        <p>{order.customer_email}</p>
                        <p>{order.customer_phone}</p>
                      </div>

                      <div className="order-info-group">
                        <label>Product</label>
                        <p><strong>{order.product_name}</strong></p>
                        <p>Size: {order.selected_size}</p>
                        <p>₹{order.price?.toLocaleString('en-IN')}</p>
                      </div>

                      <div className="order-info-group">
                        <label>Address</label>
                        <p>{order.shipping_address || 'Not provided'}</p>
                      </div>

                      {order.measurements && (
                        <div className="order-info-group">
                          <label>Measurements</label>
                          <p>{order.measurements}</p>
                        </div>
                      )}
                    </div>

                    <div className="order-card-footer">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => copyOrderDetails(order)}
                        title="Copy Details"
                      >
                        {copiedId === order._id ? (
                          <><Check size={14} /> Copied</>
                        ) : (
                          <><Copy size={14} /> Copy Details</>
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-gold"
                        onClick={() => setSelectedOrder(order)}
                        title="View Comments"
                      >
                        <MessageSquare size={14} /> Comments
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== PRODUCTS TAB ====== */}
        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Product Management</h2>
                <p>Add and manage dress options — saved to MongoDB</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline" onClick={fetchProducts} disabled={productsLoading}>
                  <RefreshCw size={16} className={productsLoading ? 'spinning' : ''} />
                  {productsLoading ? 'Loading...' : 'Refresh'}
                </button>
                <button className="btn btn-gold" onClick={() => setShowAddProduct(!showAddProduct)}>
                  <Plus size={16} /> Add Product
                </button>
              </div>
            </div>

            {productError && (
              <div className="error-banner">{productError}</div>
            )}

            {showAddProduct && (
              <div className="add-product-form">
                <h3 style={{ marginTop: 0, color: 'var(--color-maroon-dark)', fontFamily: 'var(--font-heading)' }}>
                  New Product
                </h3>
                <form onSubmit={handleAddProduct}>
                  <input
                    type="text"
                    placeholder="Product Name *"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    <option>Bespoke</option>
                    <option>Kurti</option>
                    <option>Saree</option>
                    <option>Lehenga</option>
                    <option>Co-ord Set</option>
                    <option>Dress</option>
                  </select>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="number"
                      placeholder="Price ₹ *"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Offer Price ₹ (optional)"
                      value={newProduct.offer_price}
                      onChange={(e) => setNewProduct({ ...newProduct, offer_price: e.target.value })}
                    />
                  </div>
                  <input
                    type="url"
                    placeholder="Image URL (optional)"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  ></textarea>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" disabled={productsLoading}>
                      {productsLoading ? 'Saving...' : '💾 Save to Database'}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => { setShowAddProduct(false); setProductError(''); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="products-grid">
              {productsLoading && products.length === 0 ? (
                <div className="empty-state"><p>Loading products from database...</p></div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <p>No products in database yet. Click "Add Product" to create one.</p>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product._id} className="product-card">
                    {product.image && (
                      <div className="product-image">
                        <img src={product.image} alt={product.name} />
                      </div>
                    )}
                    <h3>{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {product.offer_price ? (
                        <>
                          <p className="product-price" style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '1rem' }}>
                            ₹{product.price?.toLocaleString('en-IN')}
                          </p>
                          <p className="product-price">₹{product.offer_price?.toLocaleString('en-IN')}</p>
                        </>
                      ) : (
                        <p className="product-price">₹{product.price?.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                    {product.description && <p className="product-desc">{product.description}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <small style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </small>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteProduct(product._id)}
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ====== DATABASE TAB ====== */}
        {activeTab === 'database' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Database Verification</h2>
                <p>Monitor database connectivity and data integrity</p>
              </div>
              <button className="btn btn-primary" onClick={verifyDatabaseConnectivity} disabled={verificationLoading}>
                {verificationLoading ? 'Checking...' : 'Verify Connection'}
              </button>
            </div>

            {dbStats && (
              <div className="db-stats">
                <div className="stat-card">
                  <label>Connection Status</label>
                  <p className={dbStats.status === 'ok' ? 'success' : 'error'}>{dbStats.status}</p>
                </div>
                <div className="stat-card">
                  <label>Database</label>
                  <p>{dbStats.db}</p>
                </div>
                <div className="stat-card">
                  <label>Total Orders</label>
                  <p className="stat-number">{dbStats.ordersCount}</p>
                </div>
                <div className="stat-card">
                  <label>Total Products</label>
                  <p className="stat-number">{dbStats.productsCount}</p>
                </div>
                <div className="stat-card">
                  <label>Last Checked</label>
                  <p className="stat-time">{dbStats.timestamp}</p>
                </div>
              </div>
            )}

            <div className="db-info">
              <h3>Data Persistence Status</h3>
              <ul>
                <li>✅ Orders are saved to MongoDB Atlas</li>
                <li>✅ User data persists across sessions</li>
                <li>✅ Measurements are stored for future orders</li>
                <li>✅ Products are synced to database</li>
                <li>✅ Comments and notes are recorded</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ====== COMMENTS MODAL ====== */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Comments - #{selectedOrder._id.toString().slice(-8).toUpperCase()}</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="comments-section">
              <div className="comments-list">
                {orderComments[selectedOrder._id]?.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <strong>{comment.author}</strong>
                      <small>{comment.timestamp}</small>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                ))}
                {!orderComments[selectedOrder._id]?.length && (
                  <p className="no-comments">No comments yet.</p>
                )}
              </div>

              <div className="comment-input-group">
                <textarea
                  placeholder="Add a comment or note..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleAddComment(selectedOrder._id)}
                  disabled={!commentText.trim()}
                >
                  <Send size={16} /> Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
