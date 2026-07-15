import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus, getProducts, createProduct, deleteProduct, updateProduct, getCurrentUser, signOut, getCoupons, createCoupon, updateCoupon, deleteCoupon, getDiscounts, createDiscount, updateDiscount, deleteDiscount, getAnalyticsDashboard, getFaqs, createFaq, updateFaq, deleteFaq, getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../lib/api';
import { Copy, Check, RefreshCw, LogOut, Plus, X, MessageSquare, Send, Trash2, Pencil, Upload } from 'lucide-react';
import AdminInventory from './AdminInventory';
import './Admin.css';

const STATUS_OPTIONS = ['New', 'Sent', 'Stitching', 'Ready', 'Delivered'];

const EMPTY_PRODUCT = { name: '', category: 'Bespoke', price: '', offer_price: '', image: '', description: '' };

const Admin = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderComments, setOrderComments] = useState({});
  const [commentText, setCommentText] = useState('');

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [imagePreview, setImagePreview] = useState('');

  // Edit state
  const [editingProduct, setEditingProduct] = useState(null); // product being edited
  const [editData, setEditData] = useState(EMPTY_PRODUCT);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [dbStats, setDbStats] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Coupons state
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponSearch, setCouponSearch] = useState('');
  const [couponError, setCouponError] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const EMPTY_COUPON = { code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', startDate: '', expiryDate: '', usageLimit: '', perUserLimit: 1, isActive: true, description: '' };
  const [newCoupon, setNewCoupon] = useState(EMPTY_COUPON);

  // Discounts state
  const [discounts, setDiscounts] = useState([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const EMPTY_DISCOUNT = { name: '', description: '', type: 'store-wide', discountType: 'percentage', discountValue: '', applicableTo: '', minOrderAmount: '', buyQuantity: '', getQuantity: '', startDate: '', endDate: '', isActive: true };
  const [newDiscount, setNewDiscount] = useState(EMPTY_DISCOUNT);

  // Analytics state
  const [analyticsData, setAnalyticsData]       = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError]     = useState('');

  // FAQs state
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [faqError, setFaqError] = useState('');
  const EMPTY_FAQ = { question: '', answer: '', order: 0 };
  const [newFaq, setNewFaq] = useState(EMPTY_FAQ);
  const [editingFaq, setEditingFaq] = useState(null);
  const [editFaqData, setEditFaqData] = useState(EMPTY_FAQ);

  // Testimonials state
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [testimonialError, setTestimonialError] = useState('');
  const EMPTY_TESTIMONIAL = { author: '', content: '', rating: 5, avatar: '' };
  const [newTestimonial, setNewTestimonial] = useState(EMPTY_TESTIMONIAL);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [editTestimonialData, setEditTestimonialData] = useState(EMPTY_TESTIMONIAL);

  // Check JWT on mount — redirect to home if not admin
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.role === 'admin') {
      setIsAuthenticated(true);
    } else {
      navigate('/');
    }
    setAuthChecked(true);
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'coupons') fetchCoupons();
    if (activeTab === 'discounts') fetchDiscounts();
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'faqs') fetchFaqs();
    if (activeTab === 'testimonials') fetchTestimonials();
  }, [isAuthenticated, activeTab]);

  const handleLogout = () => {
    signOut();
    setIsAuthenticated(false);
    navigate('/');
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
    const text = `Order ID: ${order._id.toString().slice(-8).toUpperCase()}
Customer: ${order.customer_name}
Email: ${order.customer_email}
Phone: ${order.customer_phone}
Product: ${order.product_name}
Size: ${order.selected_size}
Measurements: ${order.measurements || 'N/A'}
Address: ${order.shipping_address}
Total: ₹${order.price?.toLocaleString('en-IN')}
Status: ${order.status}
Date: ${new Date(order.createdAt).toLocaleDateString()}`.trim();
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
        name: newProduct.name,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        offer_price: newProduct.offer_price ? parseFloat(newProduct.offer_price) : null,
        image: imagePreview || newProduct.image,
        description: newProduct.description,
      };
      const { data, error } = await createProduct(payload);
      if (error) throw new Error(error);
      setProducts(prev => [data, ...prev]);
      setNewProduct(EMPTY_PRODUCT);
      setImagePreview('');
      setShowAddProduct(false);
    } catch (err) {
      setProductError(err.message || 'Failed to save product');
    } finally {
      setProductsLoading(false);
    }
  };

  // Convert local file to base64
  const handleImageFile = (file, isEdit = false) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) setEditImagePreview(reader.result);
      else setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setEditData({
      name: product.name,
      category: product.category,
      price: product.price,
      offer_price: product.offer_price || '',
      image: product.image || '',
      description: product.description || '',
    });
    setEditImagePreview(product.image || '');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const payload = {
        name: editData.name,
        category: editData.category,
        price: parseFloat(editData.price),
        offer_price: editData.offer_price ? parseFloat(editData.offer_price) : null,
        image: editImagePreview || editData.image,
        description: editData.description,
      };
      const { data, error } = await updateProduct(editingProduct._id, payload);
      if (error) throw new Error(error);
      setProducts(prev => prev.map(p => p._id === editingProduct._id ? data : p));
      setEditingProduct(null);
    } catch (err) {
      alert('Failed to update: ' + err.message);
    } finally {
      setEditLoading(false);
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

  // ── Coupon functions ──────────────────────────────────────────────────────
  const fetchCoupons = async () => {
    setCouponsLoading(true);
    const { data } = await getCoupons();
    if (data) setCoupons(data);
    setCouponsLoading(false);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!newCoupon.code || !newCoupon.discountValue) { setCouponError('Code and discount value are required'); return; }
    const { data, error } = await createCoupon(newCoupon);
    if (error) { setCouponError(error); return; }
    setCoupons(prev => [data, ...prev]);
    setNewCoupon(EMPTY_COUPON);
    setShowAddCoupon(false);
  };

  const handleToggleCoupon = async (coupon) => {
    const { data } = await updateCoupon(coupon._id, { isActive: !coupon.isActive });
    if (data) setCoupons(prev => prev.map(c => c._id === coupon._id ? data : c));
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    await deleteCoupon(id);
    setCoupons(prev => prev.filter(c => c._id !== id));
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const getCouponStatus = (coupon) => {
    const now = new Date();
    if (!coupon.isActive) return { label: 'Inactive', color: '#9e9e9e' };
    if (coupon.startDate && new Date(coupon.startDate) > now) return { label: 'Scheduled', color: '#1565c0' };
    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) return { label: 'Expired', color: '#d32f2f' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { label: 'Used Up', color: '#e65100' };
    return { label: 'Active', color: '#2e7d32' };
  };

  // ── Discount functions ────────────────────────────────────────────────────
  const fetchDiscounts = async () => {
    setDiscountsLoading(true);
    const { data } = await getDiscounts();
    if (data) setDiscounts(data);
    setDiscountsLoading(false);
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    setDiscountError('');
    if (!newDiscount.name || !newDiscount.discountValue) { setDiscountError('Name and discount value are required'); return; }
    const { data, error } = await createDiscount(newDiscount);
    if (error) { setDiscountError(error); return; }
    setDiscounts(prev => [data, ...prev]);
    setNewDiscount(EMPTY_DISCOUNT);
    setShowAddDiscount(false);
  };

  const handleToggleDiscount = async (discount) => {
    const { data } = await updateDiscount(discount._id, { isActive: !discount.isActive });
    if (data) setDiscounts(prev => prev.map(d => d._id === discount._id ? data : d));
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Delete this discount?')) return;
    await deleteDiscount(id);
    setDiscounts(prev => prev.filter(d => d._id !== id));
  };

  // ── Analytics functions ───────────────────────────────────────────────────
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const { data, error } = await getAnalyticsDashboard();
      if (error) setAnalyticsError(error);
      else setAnalyticsData(data);
    } catch (err) {
      setAnalyticsError(err.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ── FAQ functions ─────────────────────────────────────────────────────────
  const fetchFaqs = async () => {
    setFaqsLoading(true);
    const { data } = await getFaqs();
    if (data) setFaqs(data);
    setFaqsLoading(false);
  };

  const handleCreateFaq = async (e) => {
    e.preventDefault();
    setFaqError('');
    if (!newFaq.question || !newFaq.answer) { setFaqError('Question and answer are required'); return; }
    const { data, error } = await createFaq(newFaq);
    if (error) { setFaqError(error); return; }
    setFaqs(prev => [data, ...prev]);
    setNewFaq(EMPTY_FAQ);
    setShowAddFaq(false);
  };

  const handleEditFaq = (faq) => {
    setEditingFaq(faq);
    setEditFaqData({ question: faq.question, answer: faq.answer, order: faq.order });
  };

  const handleSaveEditFaq = async (e) => {
    e.preventDefault();
    if (!editFaqData.question || !editFaqData.answer) return;
    const { data, error } = await updateFaq(editingFaq._id, editFaqData);
    if (error) { setFaqError(error); return; }
    setFaqs(prev => prev.map(f => f._id === editingFaq._id ? data : f));
    setEditingFaq(null);
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    await deleteFaq(id);
    setFaqs(prev => prev.filter(f => f._id !== id));
  };

  // ── Testimonial functions ────────────────────────────────────────────────
  const fetchTestimonials = async () => {
    setTestimonialsLoading(true);
    const { data } = await getTestimonials();
    if (data) setTestimonials(data);
    setTestimonialsLoading(false);
  };

  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    setTestimonialError('');
    if (!newTestimonial.author || !newTestimonial.content) { setTestimonialError('Author and content are required'); return; }
    const { data, error } = await createTestimonial(newTestimonial);
    if (error) { setTestimonialError(error); return; }
    setTestimonials(prev => [data, ...prev]);
    setNewTestimonial(EMPTY_TESTIMONIAL);
    setShowAddTestimonial(false);
  };

  const handleEditTestimonial = (testimonial) => {
    setEditingTestimonial(testimonial);
    setEditTestimonialData({ author: testimonial.author, content: testimonial.content, rating: testimonial.rating, avatar: testimonial.avatar || '' });
  };

  const handleSaveEditTestimonial = async (e) => {
    e.preventDefault();
    if (!editTestimonialData.author || !editTestimonialData.content) return;
    const { data, error } = await updateTestimonial(editingTestimonial._id, editTestimonialData);
    if (error) { setTestimonialError(error); return; }
    setTestimonials(prev => prev.map(t => t._id === editingTestimonial._id ? data : t));
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    await deleteTestimonial(id);
    setTestimonials(prev => prev.filter(t => t._id !== id));
  };

  const DISCOUNT_TYPE_LABELS = {
    'store-wide': '🏪 Store-wide', 'category': '📁 Category', 'product': '👗 Product',
    'buy-x-get-y': '🎁 Buy X Get Y', 'free-shipping': '🚚 Free Shipping',
    'festival': '🎉 Festival Sale', 'flash-sale': '⚡ Flash Sale', 'limited-time': '⏱️ Limited Time',
  };

  const handleAddComment = (orderId) => {
    if (!commentText.trim()) return;
    const updated = {
      ...orderComments,
      [orderId]: [
        ...(orderComments[orderId] || []),
        { id: Date.now(), text: commentText, timestamp: new Date().toLocaleString(), author: 'Admin' }
      ]
    };
    setOrderComments(updated);
    setCommentText('');
  };

  const verifyDatabaseConnectivity = async () => {
    setVerificationLoading(true);
    try {
      const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
      const response = await fetch(`${BASE}/api/health`);
      const data = await response.json();
      const [ordersRes, productsRes] = await Promise.all([getOrders(), getProducts()]);
      setDbStats({
        status: data.status,
        db: data.db === 'connected' ? '✅ Connected' : '❌ Disconnected',
        timestamp: new Date().toLocaleString(),
        ordersCount: ordersRes.data?.length ?? 0,
        productsCount: productsRes.data?.length ?? 0,
      });
    } catch (err) {
      setDbStats({
        status: 'error', db: '❌ Connection Error', error: err.message,
        timestamp: new Date().toLocaleString(), ordersCount: 0, productsCount: 0,
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  // Wait until auth check completes
  if (!authChecked) return null;

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-brand">LIVAANI</h2>
          <p className="admin-brand-sub">Admin Portal</p>
        </div>

        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            🛒 Orders
          </button>
          <button className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            👗 Products
          </button>
          <button className={`admin-nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            📦 Inventory
          </button>
          <button className={`admin-nav-item ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>
            🎟️ Coupons
          </button>
          <button className={`admin-nav-item ${activeTab === 'discounts' ? 'active' : ''}`} onClick={() => setActiveTab('discounts')}>
            🏷️ Discounts
          </button>
          <button className={`admin-nav-item ${activeTab === 'faqs' ? 'active' : ''}`} onClick={() => setActiveTab('faqs')}>
            ❓ FAQs
          </button>
          <button className={`admin-nav-item ${activeTab === 'testimonials' ? 'active' : ''}`} onClick={() => setActiveTab('testimonials')}>
            ⭐ Testimonials
          </button>
          <button className={`admin-nav-item ${activeTab === 'database' ? 'active' : ''}`} onClick={() => setActiveTab('database')}>
            💾 Database
          </button>
          <button className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            📊 Analytics
          </button>
        </nav>

        <button className="btn btn-gold admin-logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="admin-main">

        {/* ORDERS TAB */}
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
              <div className="empty-state"><p>No orders found.</p></div>
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
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
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
                      <button className="btn btn-sm btn-outline" onClick={() => copyOrderDetails(order)}>
                        {copiedId === order._id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Details</>}
                      </button>
                      <button className="btn btn-sm btn-gold" onClick={() => setSelectedOrder(order)}>
                        <MessageSquare size={14} /> Comments
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
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

            {productError && <div className="error-banner">{productError}</div>}

            {showAddProduct && (
              <div className="add-product-form">
                <h3 style={{ marginTop: 0, color: 'var(--color-maroon-dark)', fontFamily: 'var(--font-heading)' }}>New Product</h3>
                <form onSubmit={handleAddProduct}>
                  <input type="text" placeholder="Product Name *" value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                    <option>Bespoke</option>
                    <option>Kurti</option>
                    <option>Saree</option>
                    <option>Lehenga</option>
                    <option>Co-ord Set</option>
                    <option>Dress</option>
                    <option>Sleeveless Kurti</option>
                    <option>Full Sleeve Kurti</option>
                    <option>Corset Kurti</option>
                    <option>Noodle Strap Kurti</option>
                    <option>Halter Neck Kurti</option>
                  </select>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input type="number" placeholder="Price ₹ *" value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
                    <input type="number" placeholder="Offer Price ₹ (optional)" value={newProduct.offer_price}
                      onChange={(e) => setNewProduct({ ...newProduct, offer_price: e.target.value })} />
                  </div>

                  {/* Image upload */}
                  <div className="image-upload-group">
                    <div className="image-upload-btn" onClick={() => fileInputRef.current.click()}>
                      <Upload size={18} />
                      <span>{imagePreview ? 'Change Image' : 'Upload Image from Device'}</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageFile(e.target.files[0])}
                    />
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button type="button" className="image-preview-remove" onClick={() => setImagePreview('')}>
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <textarea placeholder="Description (optional)" value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" disabled={productsLoading}>
                      {productsLoading ? 'Saving...' : '💾 Save to Database'}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => { setShowAddProduct(false); setProductError(''); setImagePreview(''); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="products-grid">
              {productsLoading && products.length === 0 ? (
                <div className="empty-state"><p>Loading products...</p></div>
              ) : products.length === 0 ? (
                <div className="empty-state"><p>No products yet. Click "Add Product" to create one.</p></div>
              ) : (
                products.map((product) => (
                  <div key={product._id} className="product-card">
                    {product.image && <div className="product-image"><img src={product.image} alt={product.name} /></div>}
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
                      <small style={{ color: 'var(--color-text-secondary)' }}>{new Date(product.createdAt).toLocaleDateString()}</small>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-edit" onClick={() => startEdit(product)} title="Edit product">
                          <Pencil size={14} />
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteProduct(product._id)} title="Delete product">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && <AdminInventory />}

        {/* COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>🎟️ Coupons</h2>
                <p>Create and manage discount coupon codes</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search coupons..."
                  value={couponSearch}
                  onChange={e => setCouponSearch(e.target.value)}
                  style={{ padding: '8px 14px', border: '1px solid var(--color-gold-base)', borderRadius: '4px', fontSize: '0.85rem', width: '180px' }}
                />
                <button className="btn btn-gold" onClick={() => setShowAddCoupon(!showAddCoupon)}>
                  <Plus size={16} /> Create Coupon
                </button>
              </div>
            </div>

            {couponError && <div className="error-banner">{couponError}</div>}

            {/* Add Coupon Form */}
            {showAddCoupon && (
              <div className="add-product-form" style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 20px', color: 'var(--color-maroon-dark)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>✦ New Coupon</h3>
                <form onSubmit={handleCreateCoupon}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Coupon Code *</label>
                      <input type="text" placeholder="e.g. LIV10, WELCOME20" value={newCoupon.code}
                        onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} required
                        style={{ textTransform: 'uppercase', fontWeight: '700', letterSpacing: '2px' }} />
                    </div>
                    <div>
                      <label className="form-label">Description</label>
                      <input type="text" placeholder="e.g. 10% off for new users" value={newCoupon.description}
                        onChange={e => setNewCoupon({...newCoupon, description: e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">Discount Type *</label>
                      <select value={newCoupon.discountType} onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value})}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Discount Value *</label>
                      <input type="number" placeholder={newCoupon.discountType === 'percentage' ? 'e.g. 10' : 'e.g. 150'} value={newCoupon.discountValue}
                        onChange={e => setNewCoupon({...newCoupon, discountValue: e.target.value})} required />
                    </div>
                    <div>
                      <label className="form-label">Min Order Amount (₹)</label>
                      <input type="number" placeholder="e.g. 500" value={newCoupon.minOrderAmount}
                        onChange={e => setNewCoupon({...newCoupon, minOrderAmount: e.target.value})} />
                    </div>
                    {newCoupon.discountType === 'percentage' && (
                      <div>
                        <label className="form-label">Max Discount (₹)</label>
                        <input type="number" placeholder="e.g. 500" value={newCoupon.maxDiscount}
                          onChange={e => setNewCoupon({...newCoupon, maxDiscount: e.target.value})} />
                      </div>
                    )}
                    <div>
                      <label className="form-label">Start Date</label>
                      <input type="datetime-local" value={newCoupon.startDate}
                        onChange={e => setNewCoupon({...newCoupon, startDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">Expiry Date</label>
                      <input type="datetime-local" value={newCoupon.expiryDate}
                        onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">Total Usage Limit</label>
                      <input type="number" placeholder="Leave blank for unlimited" value={newCoupon.usageLimit}
                        onChange={e => setNewCoupon({...newCoupon, usageLimit: e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">Per User Limit</label>
                      <input type="number" placeholder="e.g. 1" value={newCoupon.perUserLimit}
                        onChange={e => setNewCoupon({...newCoupon, perUserLimit: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button type="submit" className="btn btn-primary">💾 Save Coupon</button>
                    <button type="button" className="btn btn-outline" onClick={() => { setShowAddCoupon(false); setCouponError(''); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Coupons List */}
            {couponsLoading ? (
              <div className="empty-state"><p>Loading coupons...</p></div>
            ) : coupons.filter(c => c.code.includes(couponSearch.toUpperCase()) || c.description?.toLowerCase().includes(couponSearch.toLowerCase())).length === 0 ? (
              <div className="empty-state"><p>No coupons yet. Create your first coupon above.</p></div>
            ) : (
              <div className="coupons-grid">
                {coupons
                  .filter(c => c.code.includes(couponSearch.toUpperCase()) || c.description?.toLowerCase().includes(couponSearch.toLowerCase()))
                  .map(coupon => {
                    const status = getCouponStatus(coupon);
                    return (
                      <div key={coupon._id} className="coupon-card">
                        <div className="coupon-card-top">
                          <div className="coupon-code-wrap">
                            <span className="coupon-code">{coupon.code}</span>
                            <button className="coupon-copy-btn" onClick={() => handleCopyCoupon(coupon.code)} title="Copy code">
                              {copiedCoupon === coupon.code ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                          <span className="coupon-status-badge" style={{ background: status.color + '20', color: status.color, border: `1px solid ${status.color}40` }}>
                            {status.label}
                          </span>
                        </div>
                        <p className="coupon-desc">{coupon.description || '—'}</p>
                        <div className="coupon-details">
                          <div className="coupon-detail-item">
                            <label>Discount</label>
                            <span>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</span>
                          </div>
                          {coupon.minOrderAmount > 0 && (
                            <div className="coupon-detail-item">
                              <label>Min Order</label>
                              <span>₹{coupon.minOrderAmount}</span>
                            </div>
                          )}
                          {coupon.maxDiscount && (
                            <div className="coupon-detail-item">
                              <label>Max Off</label>
                              <span>₹{coupon.maxDiscount}</span>
                            </div>
                          )}
                          <div className="coupon-detail-item">
                            <label>Used</label>
                            <span>{coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</span>
                          </div>
                          {coupon.expiryDate && (
                            <div className="coupon-detail-item">
                              <label>Expires</label>
                              <span>{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="coupon-card-footer">
                          <button
                            className={`btn btn-sm ${coupon.isActive ? 'btn-outline' : 'btn-primary'}`}
                            onClick={() => handleToggleCoupon(coupon)}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {coupon.isActive ? '⏸ Deactivate' : '▶ Activate'}
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteCoupon(coupon._id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* DISCOUNTS TAB */}
        {activeTab === 'discounts' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>🏷️ Automatic Discounts</h2>
                <p>Create automatic discounts — no coupon code needed</p>
              </div>
              <button className="btn btn-gold" onClick={() => setShowAddDiscount(!showAddDiscount)}>
                <Plus size={16} /> Create Discount
              </button>
            </div>

            {discountError && <div className="error-banner">{discountError}</div>}

            {/* Add Discount Form */}
            {showAddDiscount && (
              <div className="add-product-form" style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 20px', color: 'var(--color-maroon-dark)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>✦ New Discount</h3>
                <form onSubmit={handleCreateDiscount}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Discount Name *</label>
                      <input type="text" placeholder="e.g. Diwali Sale" value={newDiscount.name}
                        onChange={e => setNewDiscount({...newDiscount, name: e.target.value})} required />
                    </div>
                    <div>
                      <label className="form-label">Discount Type</label>
                      <select value={newDiscount.type} onChange={e => setNewDiscount({...newDiscount, type: e.target.value})}>
                        {Object.entries(DISCOUNT_TYPE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Description</label>
                      <input type="text" placeholder="Describe the discount" value={newDiscount.description}
                        onChange={e => setNewDiscount({...newDiscount, description: e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">Discount Value Type</label>
                      <select value={newDiscount.discountType} onChange={e => setNewDiscount({...newDiscount, discountType: e.target.value})}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Discount Value *</label>
                      <input type="number" placeholder={newDiscount.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 200'} value={newDiscount.discountValue}
                        onChange={e => setNewDiscount({...newDiscount, discountValue: e.target.value})} required />
                    </div>
                    {['category', 'product'].includes(newDiscount.type) && (
                      <div>
                        <label className="form-label">Applies To (Category/Product)</label>
                        <input type="text" placeholder="e.g. Kurta Set" value={newDiscount.applicableTo}
                          onChange={e => setNewDiscount({...newDiscount, applicableTo: e.target.value})} />
                      </div>
                    )}
                    {newDiscount.type === 'buy-x-get-y' && (
                      <>
                        <div>
                          <label className="form-label">Buy Quantity</label>
                          <input type="number" placeholder="e.g. 2" value={newDiscount.buyQuantity}
                            onChange={e => setNewDiscount({...newDiscount, buyQuantity: e.target.value})} />
                        </div>
                        <div>
                          <label className="form-label">Get Quantity</label>
                          <input type="number" placeholder="e.g. 1" value={newDiscount.getQuantity}
                            onChange={e => setNewDiscount({...newDiscount, getQuantity: e.target.value})} />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="form-label">Min Order Amount (₹)</label>
                      <input type="number" placeholder="0 = no minimum" value={newDiscount.minOrderAmount}
                        onChange={e => setNewDiscount({...newDiscount, minOrderAmount: e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">Start Date</label>
                      <input type="datetime-local" value={newDiscount.startDate}
                        onChange={e => setNewDiscount({...newDiscount, startDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="form-label">End Date</label>
                      <input type="datetime-local" value={newDiscount.endDate}
                        onChange={e => setNewDiscount({...newDiscount, endDate: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button type="submit" className="btn btn-primary">💾 Save Discount</button>
                    <button type="button" className="btn btn-outline" onClick={() => { setShowAddDiscount(false); setDiscountError(''); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Discounts List */}
            {discountsLoading ? (
              <div className="empty-state"><p>Loading discounts...</p></div>
            ) : discounts.length === 0 ? (
              <div className="empty-state"><p>No discounts yet. Create your first discount above.</p></div>
            ) : (
              <div className="discounts-grid">
                {discounts.map(discount => (
                  <div key={discount._id} className={`discount-card ${discount.isActive ? 'discount-active' : 'discount-inactive'}`}>
                    <div className="discount-card-header">
                      <div>
                        <span className="discount-type-tag">{DISCOUNT_TYPE_LABELS[discount.type]}</span>
                        <h3 className="discount-name">{discount.name}</h3>
                      </div>
                      <span className="discount-value-badge">
                        {discount.discountType === 'percentage' ? `${discount.discountValue}% OFF` : `₹${discount.discountValue} OFF`}
                      </span>
                    </div>
                    {discount.description && <p className="discount-desc">{discount.description}</p>}
                    <div className="discount-meta">
                      {discount.applicableTo && <span>📁 {discount.applicableTo}</span>}
                      {discount.minOrderAmount > 0 && <span>Min ₹{discount.minOrderAmount}</span>}
                      {discount.endDate && <span>⏱ Ends {new Date(discount.endDate).toLocaleDateString()}</span>}
                      {discount.type === 'buy-x-get-y' && discount.buyQuantity && (
                        <span>Buy {discount.buyQuantity} Get {discount.getQuantity}</span>
                      )}
                    </div>
                    <div className="coupon-card-footer">
                      <button
                        className={`btn btn-sm ${discount.isActive ? 'btn-outline' : 'btn-primary'}`}
                        onClick={() => handleToggleDiscount(discount)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {discount.isActive ? '⏸ Deactivate' : '▶ Activate'}
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteDiscount(discount._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DATABASE TAB */}
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
                <div className="stat-card"><label>Database</label><p>{dbStats.db}</p></div>
                <div className="stat-card"><label>Total Orders</label><p className="stat-number">{dbStats.ordersCount}</p></div>
                <div className="stat-card"><label>Total Products</label><p className="stat-number">{dbStats.productsCount}</p></div>
                <div className="stat-card"><label>Last Checked</label><p className="stat-time">{dbStats.timestamp}</p></div>
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

        {/* FAQs TAB */}
        {activeTab === 'faqs' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>❓ FAQs Management</h2>
                <p>Create and manage frequently asked questions</p>
              </div>
              <button className="btn btn-gold" onClick={() => setShowAddFaq(!showAddFaq)}>
                <Plus size={16} /> Add FAQ
              </button>
            </div>

            {faqError && <div className="error-banner">{faqError}</div>}

            {/* Add FAQ Form */}
            {showAddFaq && (
              <div className="add-product-form" style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 20px', color: 'var(--color-maroon-dark)', fontFamily: 'var(--font-heading)' }}>✦ New FAQ</h3>
                <form onSubmit={handleCreateFaq}>
                  <input type="text" placeholder="Question *" value={newFaq.question}
                    onChange={e => setNewFaq({...newFaq, question: e.target.value})} required />
                  <textarea placeholder="Answer *" value={newFaq.answer}
                    onChange={e => setNewFaq({...newFaq, answer: e.target.value})} required style={{ minHeight: '120px' }} />
                  <input type="number" placeholder="Display Order (0 = first)" value={newFaq.order}
                    onChange={e => setNewFaq({...newFaq, order: parseInt(e.target.value) || 0})} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary">💾 Save FAQ</button>
                    <button type="button" className="btn btn-outline" onClick={() => { setShowAddFaq(false); setFaqError(''); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* FAQs List */}
            {faqsLoading && faqs.length === 0 ? (
              <div className="empty-state"><p>Loading FAQs...</p></div>
            ) : faqs.length === 0 ? (
              <div className="empty-state"><p>No FAQs yet. Click "Add FAQ" to create one.</p></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {faqs.map((faq) => (
                  <div key={faq._id} style={{ border: '1px solid var(--color-gold-base)', borderRadius: '8px', padding: '16px', backgroundColor: '#fafaf5' }}>
                    {editingFaq?._id === faq._id ? (
                      <form onSubmit={handleSaveEditFaq}>
                        <input type="text" value={editFaqData.question}
                          onChange={e => setEditFaqData({...editFaqData, question: e.target.value})} required />
                        <textarea value={editFaqData.answer}
                          onChange={e => setEditFaqData({...editFaqData, answer: e.target.value})} required style={{ minHeight: '100px' }} />
                        <input type="number" value={editFaqData.order}
                          onChange={e => setEditFaqData({...editFaqData, order: parseInt(e.target.value) || 0})} />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button type="submit" className="btn btn-primary">Save</button>
                          <button type="button" className="btn btn-outline" onClick={() => setEditingFaq(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h4 style={{ margin: '0 0 8px', color: 'var(--color-maroon-dark)' }}>Q: {faq.question}</h4>
                        <p style={{ margin: '0 0 12px', color: '#666', lineHeight: '1.5' }}>A: {faq.answer}</p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn-edit" onClick={() => handleEditFaq(faq)} title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteFaq(faq._id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TESTIMONIALS TAB */}
        {activeTab === 'testimonials' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>⭐ Testimonials Management</h2>
                <p>Manage customer testimonials and reviews</p>
              </div>
              <button className="btn btn-gold" onClick={() => setShowAddTestimonial(!showAddTestimonial)}>
                <Plus size={16} /> Add Testimonial
              </button>
            </div>

            {testimonialError && <div className="error-banner">{testimonialError}</div>}

            {/* Add Testimonial Form */}
            {showAddTestimonial && (
              <div className="add-product-form" style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 20px', color: 'var(--color-maroon-dark)', fontFamily: 'var(--font-heading)' }}>✦ New Testimonial</h3>
                <form onSubmit={handleCreateTestimonial}>
                  <input type="text" placeholder="Author Name *" value={newTestimonial.author}
                    onChange={e => setNewTestimonial({...newTestimonial, author: e.target.value})} required />
                  <textarea placeholder="Testimonial Content *" value={newTestimonial.content}
                    onChange={e => setNewTestimonial({...newTestimonial, content: e.target.value})} required style={{ minHeight: '100px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Rating (1-5) *</label>
                      <select value={newTestimonial.rating}
                        onChange={e => setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value)})}>
                        <option value={1}>⭐ 1 Star</option>
                        <option value={2}>⭐⭐ 2 Stars</option>
                        <option value={3}>⭐⭐⭐ 3 Stars</option>
                        <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                        <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Avatar URL (optional)</label>
                      <input type="url" placeholder="https://..." value={newTestimonial.avatar}
                        onChange={e => setNewTestimonial({...newTestimonial, avatar: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary">💾 Save Testimonial</button>
                    <button type="button" className="btn btn-outline" onClick={() => { setShowAddTestimonial(false); setTestimonialError(''); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Testimonials List */}
            {testimonialsLoading && testimonials.length === 0 ? (
              <div className="empty-state"><p>Loading testimonials...</p></div>
            ) : testimonials.length === 0 ? (
              <div className="empty-state"><p>No testimonials yet. Click "Add Testimonial" to create one.</p></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {testimonials.map((testimonial) => (
                  <div key={testimonial._id} style={{ border: '1px solid var(--color-gold-base)', borderRadius: '8px', padding: '16px', backgroundColor: '#fafaf5' }}>
                    {editingTestimonial?._id === testimonial._id ? (
                      <form onSubmit={handleSaveEditTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input type="text" value={editTestimonialData.author}
                          onChange={e => setEditTestimonialData({...editTestimonialData, author: e.target.value})} required />
                        <textarea value={editTestimonialData.content}
                          onChange={e => setEditTestimonialData({...editTestimonialData, content: e.target.value})} required style={{ minHeight: '80px' }} />
                        <select value={editTestimonialData.rating}
                          onChange={e => setEditTestimonialData({...editTestimonialData, rating: parseInt(e.target.value)})}>
                          <option value={1}>⭐ 1 Star</option>
                          <option value={2}>⭐⭐ 2 Stars</option>
                          <option value={3}>⭐⭐⭐ 3 Stars</option>
                          <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                          <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                        </select>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button type="submit" className="btn btn-primary">Save</button>
                          <button type="button" className="btn btn-outline" onClick={() => setEditingTestimonial(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 4px', color: 'var(--color-maroon-dark)' }}>{testimonial.author}</h4>
                            <p style={{ margin: 0, color: '#d4a574', fontSize: '0.9rem' }}>{'⭐'.repeat(testimonial.rating)}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn-edit" onClick={() => handleEditTestimonial(testimonial)} title="Edit">
                              <Pencil size={14} />
                            </button>
                            <button className="btn-delete" onClick={() => handleDeleteTestimonial(testimonial._id)} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p style={{ margin: '0 0 12px', color: '#666', lineHeight: '1.5', fontSize: '0.95rem' }}>"{testimonial.content}"</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>📊 Analytics Dashboard</h2>
                <p>Conversion funnel from analytics events · Sales data from orders</p>
              </div>
              <button className="btn btn-outline" onClick={fetchAnalytics} disabled={analyticsLoading}>
                <RefreshCw size={16} className={analyticsLoading ? 'spinning' : ''} />
                {analyticsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {analyticsError && <div className="error-banner">{analyticsError}</div>}

            {analyticsLoading && (
              <div className="empty-state"><p>Loading analytics data...</p></div>
            )}

            {!analyticsLoading && analyticsData && (
              <>
                {/* ── CONVERSION RATE ──────────────────────────────────── */}
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-maroon-dark)', margin: '0 0 16px', fontSize: '1.2rem', letterSpacing: '1px' }}>
                  Conversion Rate
                </h3>
                <div className="db-stats" style={{ marginBottom: '36px' }}>
                  <div className="stat-card">
                    <label>Visitors</label>
                    <p className="stat-number">{analyticsData.conversionFunnel.visitors.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="stat-card">
                    <label>Add to Cart Rate</label>
                    <p className="stat-number">{analyticsData.conversionFunnel.addToCartRate.toFixed(2)}%</p>
                  </div>
                  <div className="stat-card">
                    <label>Checkout Rate</label>
                    <p className="stat-number">{analyticsData.conversionFunnel.checkoutRate.toFixed(2)}%</p>
                  </div>
                  <div className="stat-card">
                    <label>Purchase Rate</label>
                    <p className="stat-number">{analyticsData.conversionFunnel.purchaseRate.toFixed(2)}%</p>
                  </div>
                  <div className="stat-card">
                    <label>Overall Conversion %</label>
                    <p className="stat-number">{analyticsData.conversionFunnel.overallConversion.toFixed(2)}%</p>
                  </div>
                </div>

                {/* ── BEST-SELLING PRODUCTS ────────────────────────────── */}
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-maroon-dark)', margin: '0 0 16px', fontSize: '1.2rem', letterSpacing: '1px' }}>
                  Best-Selling Products
                </h3>
                {analyticsData.bestSellers.length === 0 ? (
                  <div className="empty-state" style={{ marginBottom: '36px' }}><p>No sales data yet.</p></div>
                ) : (
                  <div style={{ overflowX: 'auto', marginBottom: '36px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '2px solid var(--color-gold-light)' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-gold-dark)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rank</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-gold-dark)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Name</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-gold-dark)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Units Sold</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-gold-dark)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-gold-dark)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.bestSellers.map((item, idx) => (
                          <tr key={item.productName} style={{ borderBottom: '1px solid var(--color-gold-light)', background: idx % 2 === 0 ? '#fff' : 'var(--color-bg-primary)' }}>
                            <td style={{ padding: '12px 16px', color: 'var(--color-maroon)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>#{idx + 1}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--color-text-primary)', fontWeight: '600' }}>{item.productName || '—'}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-primary)' }}>{item.unitsSold.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-maroon)', fontWeight: '700' }}>₹{item.revenue.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>{item.averageRating}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ── CATEGORY PERFORMANCE ─────────────────────────────── */}
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-maroon-dark)', margin: '0 0 16px', fontSize: '1.2rem', letterSpacing: '1px' }}>
                  Category Performance
                </h3>
                {analyticsData.categoryPerformance.length === 0 ? (
                  <div className="empty-state"><p>No category data yet.</p></div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '2px solid var(--color-gold-light)' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-gold-dark)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-gold-dark)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-gold-dark)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.categoryPerformance.map((item, idx) => {
                          const isFirst = idx === 0;
                          const isLast = idx === analyticsData.categoryPerformance.length - 1;
                          return (
                            <tr key={item.category} style={{ borderBottom: '1px solid var(--color-gold-light)', background: isFirst ? '#f0fff4' : isLast ? '#fff5f5' : idx % 2 === 0 ? '#fff' : 'var(--color-bg-primary)' }}>
                              <td style={{ padding: '12px 16px', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                                {isFirst && <span style={{ marginRight: '6px' }}>🏆</span>}
                                {isLast && analyticsData.categoryPerformance.length > 1 && <span style={{ marginRight: '6px' }}>⚠️</span>}
                                {item.category}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-maroon)', fontWeight: '700' }}>₹{item.revenue.toLocaleString('en-IN')}</td>
                              <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-primary)' }}>{item.orderCount.toLocaleString('en-IN')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {!analyticsLoading && !analyticsData && !analyticsError && (
              <div className="empty-state"><p>Click Refresh to load analytics data.</p></div>
            )}
          </div>
        )}
      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button className="modal-close" onClick={() => setEditingProduct(null)}><X size={20} /></button>
            </div>
            <div style={{ padding: '25px' }}>
              <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Product Name *" value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  required style={{ padding: '12px', border: '1px solid var(--color-gold-base)', borderRadius: '4px', fontSize: '0.95rem' }} />
                <select value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  style={{ padding: '12px', border: '1px solid var(--color-gold-base)', borderRadius: '4px', fontSize: '0.95rem' }}>
                  <option>Bespoke</option><option>Kurti</option><option>Saree</option><option>Lehenga</option>
                  <option>Co-ord Set</option><option>Dress</option><option>Sleeveless Kurti</option>
                  <option>Full Sleeve Kurti</option><option>Corset Kurti</option>
                  <option>Noodle Strap Kurti</option><option>Halter Neck Kurti</option>
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input type="number" placeholder="Price ₹ *" value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                    required style={{ padding: '12px', border: '1px solid var(--color-gold-base)', borderRadius: '4px', fontSize: '0.95rem' }} />
                  <input type="number" placeholder="Offer Price ₹ (optional)" value={editData.offer_price}
                    onChange={(e) => setEditData({ ...editData, offer_price: e.target.value })}
                    style={{ padding: '12px', border: '1px solid var(--color-gold-base)', borderRadius: '4px', fontSize: '0.95rem' }} />
                </div>

                {/* Edit image upload */}
                <div className="image-upload-group">
                  <div className="image-upload-btn" onClick={() => editFileInputRef.current.click()}>
                    <Upload size={18} />
                    <span>{editImagePreview ? 'Change Image' : 'Upload New Image'}</span>
                  </div>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageFile(e.target.files[0], true)}
                  />
                  {editImagePreview && (
                    <div className="image-preview">
                      <img src={editImagePreview} alt="Preview" />
                      <button type="button" className="image-preview-remove"
                        onClick={() => setEditImagePreview('')}><X size={16} /></button>
                    </div>
                  )}
                </div>

                <textarea placeholder="Description (optional)" value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  style={{ padding: '12px', border: '1px solid var(--color-gold-base)', borderRadius: '4px', fontSize: '0.95rem', minHeight: '80px', resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" disabled={editLoading}>
                    {editLoading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setEditingProduct(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Comments - #{selectedOrder._id.toString().slice(-8).toUpperCase()}</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
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
                {!orderComments[selectedOrder._id]?.length && <p className="no-comments">No comments yet.</p>}
              </div>
              <div className="comment-input-group">
                <textarea placeholder="Add a comment or note..." value={commentText}
                  onChange={(e) => setCommentText(e.target.value)} />
                <button className="btn btn-primary" onClick={() => handleAddComment(selectedOrder._id)} disabled={!commentText.trim()}>
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
