// Load .env from server/ folder (local dev) or use Railway env vars in production
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes          = require('./routes/auth');
const orderRoutes         = require('./routes/orders');
const productRoutes       = require('./routes/products');
const couponRoutes        = require('./routes/coupons');
const discountRoutes      = require('./routes/discounts');
const inventoryRoutes     = require('./routes/inventory');
const invoiceRoutes       = require('./routes/invoices');
const returnRoutes        = require('./routes/returns');
const exchangeRoutes      = require('./routes/exchanges');
const cancellationRoutes  = require('./routes/cancellations');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
// Stub routes for FAQs / Testimonials / Analytics (prevent 404s)
let faqRoutes, testimonialRoutes, analyticsRoutes;
try { faqRoutes = require('./routes/faqs'); } catch { faqRoutes = null; }
try { testimonialRoutes = require('./routes/testimonials'); } catch { testimonialRoutes = null; }
try { analyticsRoutes = require('./routes/analytics'); } catch { analyticsRoutes = null; }

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',             authRoutes);
app.use('/api/orders',          orderRoutes);
app.use('/api/products',        productRoutes);
app.use('/api/coupons',         couponRoutes);
app.use('/api/discounts',       discountRoutes);
app.use('/api/inventory',       inventoryRoutes);
app.use('/api/invoices',        invoiceRoutes);
app.use('/api/returns',         returnRoutes);
app.use('/api/exchanges',       exchangeRoutes);
app.use('/api/cancellations',   cancellationRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
if (faqRoutes)         app.use('/api/faqs',         faqRoutes);
if (testimonialRoutes) app.use('/api/testimonials',  testimonialRoutes);
if (analyticsRoutes)   app.use('/api/analytics',     analyticsRoutes);

// Business KPI summary endpoint
app.get('/api/business/kpis', async (req, res) => {
  try {
    const Order                = require('./models/Order');
    const ReturnRequest        = require('./models/ReturnRequest');
    const ExchangeRequest      = require('./models/ExchangeRequest');
    const CancellationRequest  = require('./models/CancellationRequest');
    const PurchaseOrder        = require('./models/PurchaseOrder');
    const Product              = require('./models/Product');

    const [orders, returns, exchanges, cancellations, pos, products] = await Promise.all([
      Order.find(),
      ReturnRequest.find(),
      ExchangeRequest.find(),
      CancellationRequest.find(),
      PurchaseOrder.find(),
      Product.find(),
    ]);

    const totalSales       = orders.reduce((s, o) => s + (o.price || 0), 0);
    const totalReturns     = returns.length;
    const totalExchanges   = exchanges.length;
    const cancelledOrders  = cancellations.filter(c => c.status === 'Approved').length;
    const pendingRefunds   = returns.filter(r => r.status === 'Refund Initiated').length
                           + cancellations.filter(c => c.status === 'Refund Processing').length;
    const activePOs        = pos.filter(p => ['Sent', 'Confirmed', 'Partially Received'].includes(p.status)).length;
    const inventoryValue   = products.reduce((s, p) => s + ((p.offer_price || p.price) * (p.stock || 0)), 0);

    res.json({ data: { totalSales, totalReturns, totalExchanges, cancelledOrders, pendingRefunds, activePOs, inventoryValue }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
);

// ─── Serve React Build ───────────────────────────────────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// All non-API routes → React index.html (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 App running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
