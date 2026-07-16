const express = require('express');
const ReturnRequest = require('../models/ReturnRequest');
const Order         = require('../models/Order');
const Product       = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/returns — customer submits return request
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, reason, comments, images, productName, productId, quantity } = req.body;
    if (!orderId || !reason) return res.status(400).json({ error: 'orderId and reason are required' });

    // Prevent duplicate active requests for same order
    const existing = await ReturnRequest.findOne({
      orderId,
      status: { $nin: ['Rejected', 'Completed'] },
    });
    if (existing) {
      return res.status(400).json({ error: 'A return request for this order is already in progress' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const returnReq = await ReturnRequest.create({
      orderId,
      orderRef:      order._id.toString().slice(-8).toUpperCase(),
      customerName:  req.body.customerName || order.customer_name,
      customerEmail: req.body.customerEmail || order.customer_email || req.user.email,
      customerPhone: req.body.customerPhone || order.customer_phone,
      productName:   productName || order.product_name,
      productId:     productId || order.product_id || '',
      quantity:      quantity || order.quantity || 1,
      reason,
      comments:      comments || '',
      images:        images || [],
      activityLog:   [{ status: 'Return Requested', note: 'Customer submitted return request', adminEmail: req.user.email }],
    });
    res.status(201).json({ data: returnReq, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/returns — all returns (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const returns = await ReturnRequest.find().sort({ createdAt: -1 });
    res.json({ data: returns, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/returns/my — customer's own returns
router.get('/my', protect, async (req, res) => {
  try {
    const returns = await ReturnRequest.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
    res.json({ data: returns, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/returns/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const r = await ReturnRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Return request not found' });
    if (req.user.role !== 'admin' && r.customerEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ data: r, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/returns/:id — admin updates status
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote, refundAmount, refundMethod } = req.body;
    const r = await ReturnRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Return request not found' });

    if (status) {
      r.status = status;
      r.activityLog.push({ status, note: adminNote || '', adminEmail: req.user?.email || 'admin' });
      if (['Completed', 'Rejected'].includes(status)) r.resolvedAt = new Date();
    }
    if (adminNote !== undefined) r.adminNote = adminNote;
    if (refundAmount !== undefined) r.refundAmount = refundAmount;
    if (refundMethod !== undefined) r.refundMethod = refundMethod;

    // When received, restore stock
    if (status === 'Received' && r.productId) {
      try {
        const product = await Product.findById(r.productId);
        if (product) {
          const qty = r.quantity || 1;
          product.stock = (product.stock || 0) + qty;
          product.stockHistory.push({
            action: 'added', quantity: qty,
            prevStock: product.stock - qty, newStock: product.stock,
            note: `Return received — request #${r._id.toString().slice(-8)}`,
          });
          await product.save();
        }
      } catch { /* non-critical */ }
    }

    await r.save();
    res.json({ data: r, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE /api/returns/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await ReturnRequest.findByIdAndDelete(req.params.id);
    res.json({ data: { message: 'Deleted' }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
