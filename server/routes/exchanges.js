const express = require('express');
const ExchangeRequest = require('../models/ExchangeRequest');
const Order           = require('../models/Order');
const Product         = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/exchanges — customer submits exchange request
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, exchangeType, reason } = req.body;
    if (!orderId || !exchangeType || !reason) {
      return res.status(400).json({ error: 'orderId, exchangeType and reason are required' });
    }

    // Prevent duplicate active requests
    const existing = await ExchangeRequest.findOne({
      orderId,
      status: { $nin: ['Rejected', 'Completed'] },
    });
    if (existing) {
      return res.status(400).json({ error: 'An exchange request for this order is already in progress' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const exchReq = await ExchangeRequest.create({
      orderId,
      orderRef:        order._id.toString().slice(-8).toUpperCase(),
      customerName:    req.body.customerName  || order.customer_name,
      customerEmail:   req.body.customerEmail || order.customer_email || req.user.email,
      customerPhone:   req.body.customerPhone || order.customer_phone,
      productName:     req.body.productName   || order.product_name,
      productId:       req.body.productId     || order.product_id || '',
      originalSize:    req.body.originalSize  || order.selected_size || '',
      originalColor:   req.body.originalColor || '',
      exchangeType,
      newSize:         req.body.newSize      || '',
      newColor:        req.body.newColor     || '',
      newProductName:  req.body.newProductName || '',
      reason,
      notes:           req.body.notes || '',
      activityLog:     [{ status: 'Exchange Requested', note: 'Customer submitted exchange request', adminEmail: req.user.email }],
    });
    res.status(201).json({ data: exchReq, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/exchanges — all (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const exchanges = await ExchangeRequest.find().sort({ createdAt: -1 });
    res.json({ data: exchanges, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/exchanges/my — customer's own
router.get('/my', protect, async (req, res) => {
  try {
    const exchanges = await ExchangeRequest.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
    res.json({ data: exchanges, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/exchanges/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const ex = await ExchangeRequest.findById(req.params.id);
    if (!ex) return res.status(404).json({ error: 'Exchange not found' });
    if (req.user.role !== 'admin' && ex.customerEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ data: ex, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/exchanges/:id — admin updates
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote, ...rest } = req.body;
    const ex = await ExchangeRequest.findById(req.params.id);
    if (!ex) return res.status(404).json({ error: 'Exchange not found' });

    if (status) {
      ex.status = status;
      ex.activityLog.push({ status, note: adminNote || '', adminEmail: req.user?.email || 'admin' });
      if (['Completed', 'Rejected'].includes(status)) ex.resolvedAt = new Date();
    }
    if (adminNote !== undefined) ex.adminNote = adminNote;

    // When completed, update inventory (deduct old, no re-add — stitching handles new)
    if (status === 'Completed' && ex.productId) {
      try {
        const product = await Product.findById(ex.productId);
        if (product) {
          product.stockHistory.push({
            action: 'removed', quantity: 1,
            prevStock: product.stock, newStock: Math.max(0, product.stock - 1),
            note: `Exchange completed — request #${ex._id.toString().slice(-8)}`,
          });
          product.stock = Math.max(0, product.stock - 1);
          await product.save();
        }
      } catch { /* non-critical */ }
    }

    await ex.save();
    res.json({ data: ex, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE /api/exchanges/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await ExchangeRequest.findByIdAndDelete(req.params.id);
    res.json({ data: { message: 'Deleted' }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
