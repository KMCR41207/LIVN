const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — create a new order (public)
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);

    // Auto-reserve stock when order is placed
    if (req.body.product_id) {
      try {
        const qty = req.body.quantity || 1;
        const product = await Product.findById(req.body.product_id);
        if (product) {
          product.reservedStock = (product.reservedStock || 0) + qty;
          // Also decrease stock
          product.stock = Math.max(0, product.stock - qty);
          product.stockHistory.push({
            action: 'removed',
            quantity: qty,
            prevStock: product.stock + qty,
            newStock: product.stock,
            note: `Order placed #${order._id.toString().slice(-8).toUpperCase()}`,
          });
          await product.save();
        }
      } catch (stockErr) {
        console.error('Stock update failed (non-critical):', stockErr.message);
      }
    }

    res.status(201).json({ data: order, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/orders/my — get orders for the logged-in user
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer_email: req.user.email }).sort({ createdAt: -1 });
    res.json({ data: orders, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/orders — all orders (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ data: orders, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/orders/:id/status — update order status (admin)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: {
          statusHistory: { status, note: note || '', updatedAt: new Date() },
        },
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Release reserved stock when order is delivered or cancelled
    if (['Delivered', 'Cancelled'].includes(status) && order.product_id) {
      try {
        const qty = order.quantity || 1;
        const product = await Product.findById(order.product_id);
        if (product) {
          product.reservedStock = Math.max(0, (product.reservedStock || 0) - qty);
          // If cancelled, put stock back
          if (status === 'Cancelled') {
            product.stock = (product.stock || 0) + qty;
            product.stockHistory.push({
              action: 'added',
              quantity: qty,
              prevStock: product.stock - qty,
              newStock: product.stock,
              note: `Order cancelled #${order._id.toString().slice(-8).toUpperCase()}`,
            });
          } else {
            product.stockHistory.push({
              action: 'released',
              quantity: qty,
              prevStock: product.stock,
              newStock: product.stock,
              note: `Order delivered #${order._id.toString().slice(-8).toUpperCase()}`,
            });
          }
          await product.save();
        }
      } catch (stockErr) {
        console.error('Stock release failed (non-critical):', stockErr.message);
      }
    }

    res.json({ data: order, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
