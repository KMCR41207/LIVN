// ── AUTH GUARD ──
function requireAuth() {
  if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
    window.location.href = 'login.html';
  }
}

// ── FORCE RESET stale product data ──
const DATA_VERSION = '4';
if (localStorage.getItem('adminDataVersion') !== DATA_VERSION) {
  localStorage.removeItem('adminProducts');
  localStorage.setItem('adminDataVersion', DATA_VERSION);
}

function logout() {
  localStorage.removeItem('isAdminLoggedIn');
  window.location.href = 'login.html';
}

// ── TOAST ──
function showToast(msg, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = `toast ${type}`;
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── PRODUCTS DATA (localStorage) ──
const DEFAULT_PRODUCTS = [
  { id: 1, name: "Floral Sleeveless Kurti", category: "Sleeveless Kurti", image: "/static/assets/images/category_sleeveless_kurti.jpeg", qty: 50, costPrice: 800, originalPrice: 2499, offerPrice: '' },
  { id: 2, name: "Embroidered Full Sleeve Kurti", category: "Full Sleeve Kurti", image: "/static/assets/images/category_full_sleeve_kurti.jpeg", qty: 35, costPrice: 1100, originalPrice: 3199, offerPrice: 2799 },
  { id: 3, name: "Structured Corset Kurti", category: "Corset Kurti", image: "/static/assets/images/category_corset_kurti.jpeg", qty: 20, costPrice: 1400, originalPrice: 3799, offerPrice: '' },
  { id: 4, name: "Printed Noodle Strap Kurti", category: "Noodle Strap Kurti", image: "/static/assets/images/category_noodle_strap_kurti.jpeg", qty: 60, costPrice: 600, originalPrice: 1999, offerPrice: 1599 },
  { id: 5, name: "Classic Halter Neck Kurti", category: "Halter Neck Kurti", image: "/static/assets/images/category_halter_neck_kurti.jpeg", qty: 40, costPrice: 900, originalPrice: 2799, offerPrice: '' }
];

const DEFAULT_ORDERS = [
  { id: 'ORD-001', customer: 'Ananya Sharma', product: 'Floral Sleeveless Kurti', amount: 2499, status: 'Delivered', date: '2026-03-01' },
  { id: 'ORD-002', customer: 'Priya Reddy', product: 'Structured Corset Kurti', amount: 3799, status: 'Shipped', date: '2026-03-05' },
  { id: 'ORD-003', customer: 'Meera Nair', product: 'Printed Noodle Strap Kurti', amount: 1599, status: 'Pending', date: '2026-03-10' },
  { id: 'ORD-004', customer: 'Divya Iyer', product: 'Embroidered Full Sleeve Kurti', amount: 2799, status: 'Delivered', date: '2026-03-12' },
  { id: 'ORD-005', customer: 'Kavya Menon', product: 'Classic Halter Neck Kurti', amount: 2799, status: 'Pending', date: '2026-03-15' },
  { id: 'ORD-006', customer: 'Sneha Pillai', product: 'Floral Sleeveless Kurti', amount: 2499, status: 'Shipped', date: '2026-03-18' },
  { id: 'ORD-007', customer: 'Riya Kapoor', product: 'Structured Corset Kurti', amount: 3799, status: 'Delivered', date: '2026-03-20' },
  { id: 'ORD-008', customer: 'Pooja Singh', product: 'Printed Noodle Strap Kurti', amount: 1599, status: 'Pending', date: '2026-03-22' },
];

function getProducts() {
  const stored = localStorage.getItem('adminProducts');
  return stored ? JSON.parse(stored) : DEFAULT_PRODUCTS;
}

function saveProducts(products) {
  localStorage.setItem('adminProducts', JSON.stringify(products));
}

function getOrders() {
  const stored = localStorage.getItem('adminOrders');
  return stored ? JSON.parse(stored) : DEFAULT_ORDERS;
}

function saveOrders(orders) {
  localStorage.setItem('adminOrders', JSON.stringify(orders));
}

function nextProductId() {
  const products = getProducts();
  return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

function formatINR(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

const CATEGORIES = [
  'Sleeveless Kurti', 'Full Sleeve Kurti', 'Corset Kurti',
  'Noodle Strap Kurti', 'Halter Neck Kurti'
];

// ── SIDEBAR ACTIVE STATE ──
function setActivePage(page) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}
