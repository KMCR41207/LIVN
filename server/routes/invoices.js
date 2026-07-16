const express = require('express');
const Invoice = require('../models/Invoice');
const Order   = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ─── helpers ─────────────────────────────────────────────────────────────────

const GST_RATE = 0.05; // 5% for garments

const buildInvoiceFromOrder = async (order) => {
  const unitPrice = order.price || 0;
  const qty       = order.quantity || 1;
  const discount  = order.discount_amount || 0;
  const subtotal  = unitPrice * qty;
  const taxable   = subtotal - discount;
  const gstAmt    = Math.round(taxable * GST_RATE);
  const cgst      = Math.round(gstAmt / 2);
  const sgst      = Math.round(gstAmt / 2);
  const grandTotal= taxable + gstAmt;

  return {
    orderId:         order._id,
    customerName:    order.customer_name,
    customerEmail:   order.customer_email || '',
    customerPhone:   order.customer_phone || '',
    billingAddress:  order.shipping_address || '',
    shippingAddress: order.shipping_address || '',
    paymentMethod:   order.payment_method || 'cod',
    orderStatus:     order.status,
    items: [{
      productName: order.product_name,
      sku:         order.product_id || '',
      quantity:    qty,
      unitPrice,
      discount,
      gstPercent:  5,
      taxAmount:   gstAmt,
      total:       grandTotal,
    }],
    subtotal,
    discountAmount:  discount,
    shippingCharge:  0,
    cgst,
    sgst,
    igst:            0,
    grandTotal,
    isInterState:    false,
  };
};

// GET /api/invoices — all invoices (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 }).populate('orderId', 'status');
    res.json({ data: invoices, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/invoices/:id — single invoice
router.get('/:id', protect, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    // Non-admins can only view their own (by email match)
    if (req.user.role !== 'admin' && inv.customerEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ data: inv, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/invoices/generate/:orderId — generate invoice for an order (admin)
router.post('/generate/:orderId', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Check if invoice already exists
    const existing = await Invoice.findOne({ orderId: order._id });
    if (existing) return res.json({ data: existing, error: null, message: 'Invoice already exists' });

    const invoiceData = await buildInvoiceFromOrder(order);
    const invoice = await Invoice.create({
      ...invoiceData,
      sellerName:    process.env.SELLER_NAME    || 'Livaani',
      sellerGSTIN:   process.env.SELLER_GSTIN   || '',
      sellerAddress: process.env.SELLER_ADDRESS || '',
      sellerPhone:   process.env.SELLER_PHONE   || '',
      sellerEmail:   process.env.SELLER_EMAIL   || 'hello@livaani.com',
      activityLog: [{ action: 'Generated', adminEmail: req.user?.email || 'admin', note: 'Invoice generated' }],
    });
    res.status(201).json({ data: invoice, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/invoices/auto/:orderId — auto-generate on order creation (public call from order flow)
router.post('/auto/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const existing = await Invoice.findOne({ orderId: order._id });
    if (existing) return res.json({ data: existing, error: null });

    const invoiceData = await buildInvoiceFromOrder(order);
    const invoice = await Invoice.create({
      ...invoiceData,
      sellerName:    process.env.SELLER_NAME    || 'Livaani',
      sellerGSTIN:   process.env.SELLER_GSTIN   || '',
      sellerAddress: process.env.SELLER_ADDRESS || '',
      sellerPhone:   process.env.SELLER_PHONE   || '',
      sellerEmail:   process.env.SELLER_EMAIL   || 'hello@livaani.com',
    });
    res.status(201).json({ data: invoice, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/invoices/:id — update invoice (admin)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { note, ...update } = req.body;
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });

    Object.assign(inv, update);
    if (note) {
      inv.activityLog.push({ action: 'Updated', note, adminEmail: req.user?.email || 'admin' });
    }
    await inv.save();
    res.json({ data: inv, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/invoices/:id/regenerate — admin regenerates invoice from order data
router.post('/:id/regenerate', protect, adminOnly, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });

    const order = await Order.findById(inv.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const fresh = await buildInvoiceFromOrder(order);
    Object.assign(inv, fresh);
    inv.activityLog.push({ action: 'Regenerated', adminEmail: req.user?.email || 'admin', note: 'Invoice regenerated' });
    await inv.save();
    res.json({ data: inv, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/invoices/order/:orderId — get invoice by order ID
router.get('/order/:orderId', protect, async (req, res) => {
  try {
    const inv = await Invoice.findOne({ orderId: req.params.orderId });
    if (!inv) return res.status(404).json({ data: null, error: 'Invoice not found' });
    if (req.user.role !== 'admin' && inv.customerEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ data: inv, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
