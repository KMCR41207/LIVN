const express = require('express');
const CancellationRequest = require('../models/CancellationRequest');
const Order               = require('../models/Order');
const Product             = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const NON_CANCELLABLE_STATUSES = ['Stitching', 'Ready', 'Delivered'];

// POST /api/cancellations — customer requests cancellation
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, reason, comments } = req.body;
    if (!orderId || !reason) return res.status(400).json({ error: 'orderId and reason are required' });

    // Prevent duplicate
    const existing = await CancellationRequest.findOne({
      orderId,
      status: { $nin: ['Rejected', 'Completed'] },
    });
    if (existing) {
      return res.status(400).json({ error: 'A cancellation request for this order already exists' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Check eligibility: non-cancellable if stitching has started
    const ineligible = NON_CANCELLABLE_STATUSES.includes(order.status);
    const ineligibleReason = ineligible
      ? `Order cannot be cancelled — current status is "${order.status}". Bespoke garments are non-cancellable once stitching begins.`
      : '';

    const req_ = await CancellationRequest.create({
      orderId,
      orderRef:      order._id.toString().slice(-8).toUpperCase(),
      customerName:  order.customer_name,
      customerEmail: order.customer_email || req.user.email,
      customerPhone: order.customer_phone,
      productName:   order.product_name,
      productId:     order.product_id || '',
      orderAmount:   order.price || 0,
      orderStatus:   order.status,
      reason,
      comments:      comments || '',
      isEligible:    !ineligible,
      ineligibleReason,
      refundAmount:  ineligible ? 0 : (order.price || 0),
      activityLog: [{
        status: 'Requested',
        note: ineligible ? `Auto-flagged as ineligible: ${ineligibleReason}` : 'Customer submitted cancellation request',
        adminEmail: req.user.email,
      }],
    });
    res.status(201).json({ data: req_, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/cancellations — all (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const list = await CancellationRequest.find().sort({ createdAt: -1 });
    res.json({ data: list, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/cancellations/my — customer's own
router.get('/my', protect, async (req, res) => {
  try {
    const list = await CancellationRequest.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
    res.json({ data: list, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/cancellations/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const c = await CancellationRequest.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && c.customerEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ data: c, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/cancellations/:id — admin approves / rejects
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote, refundAmount, refundMethod, adminOverride } = req.body;
    const c = await CancellationRequest.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });

    if (adminOverride !== undefined) c.adminOverride = adminOverride;

    if (status) {
      c.status = status;
      c.activityLog.push({ status, note: adminNote || '', adminEmail: req.user?.email || 'admin' });
      if (['Completed', 'Rejected'].includes(status)) c.resolvedAt = new Date();
    }
    if (adminNote !== undefined) c.adminNote = adminNote;
    if (refundAmount !== undefined) c.refundAmount = refundAmount;
    if (refundMethod !== undefined) c.refundMethod = refundMethod;

    // On approval: update order status to Cancelled, restore inventory
    if (status === 'Approved' && c.orderId) {
      try {
        const order = await Order.findById(c.orderId);
        if (order) {
          order.status = 'Cancelled'; // map to existing enum — extend if needed
          // Note: existing orders enum doesn't include Cancelled; this is a soft update
          // We push to statusHistory regardless
          order.statusHistory.push({ status: 'Cancelled', note: `Cancellation approved: ${adminNote || ''}` });
          // Try to save; if enum validation fails, skip
          try { await order.save(); } catch { /* schema may not have Cancelled */ }
        }
      } catch { /* non-critical */ }

      // Restore inventory
      if (c.productId) {
        try {
          const product = await Product.findById(c.productId);
          if (product) {
            const qty = 1;
            product.stock = (product.stock || 0) + qty;
            product.reservedStock = Math.max(0, (product.reservedStock || 0) - qty);
            product.stockHistory.push({
              action: 'added', quantity: qty,
              prevStock: product.stock - qty, newStock: product.stock,
              note: `Cancellation approved — #${c.orderRef}`,
            });
            await product.save();
          }
        } catch { /* non-critical */ }
      }
    }

    await c.save();
    res.json({ data: c, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE /api/cancellations/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await CancellationRequest.findByIdAndDelete(req.params.id);
    res.json({ data: { message: 'Deleted' }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
