const express = require('express');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — create order (regular or bespoke, public)
router.post('/', async (req, res) => {
  try {
    const body = req.body;

    // Normalise bespoke payload into the schema fields
    const orderPayload = {
      order_type:     body.order_type || 'regular',
      customer_name:  body.customer_name  || body.name  || 'Guest',
      customer_email: body.customer_email || body.email || '',
      customer_phone: body.customer_phone || body.phone || '',
      status:         body.status || 'New',
    };

    if (orderPayload.order_type === 'bespoke') {
      orderPayload.bespoke_measurements = body.measurements || null;
      orderPayload.fabric                = body.fabric       || null;
      orderPayload.design                = body.design       || null;
      orderPayload.consultation          = body.consultation || null;
      orderPayload.total_amount          = body.total_amount || 0;
      orderPayload.payment_method        = 'post-consultation';
    } else {
      orderPayload.product_id       = body.product_id;
      orderPayload.product_name     = body.product_name;
      orderPayload.price            = body.price;
      orderPayload.shipping_address = body.shipping_address || body.address || '';
      orderPayload.measurements     = body.measurements     || '';
      orderPayload.selected_size    = body.selected_size    || body.size   || 'Standard';
      orderPayload.quantity         = body.quantity         || body.qty    || 1;
      orderPayload.payment_method   = body.payment_method  || 'cod';
      orderPayload.upi_id           = body.upi_id          || '';
      orderPayload.total_amount     = body.price           || 0;
    }

    const order = await Order.create(orderPayload);
    res.status(201).json({ data: order, error: null });
  } catch (err) {
    console.error('Create order error:', err.message);
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/orders/my — orders for the logged-in user
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer_email: req.user.email })
      .sort({ createdAt: -1 });
    res.json({ data: orders, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/orders — all orders (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ data: orders, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/orders/:id/status — update status (admin only)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: order, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
