const express = require('express');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST validate coupon (public — used at checkout)
// MUST be before /:id routes so Express doesn't match 'validate' as an id
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ data: null, error: 'Coupon code is required' });
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.json({ data: null, error: 'Invalid coupon code' });

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) return res.json({ data: null, error: 'Coupon not yet active' });
    if (coupon.expiryDate && now > coupon.expiryDate) return res.json({ data: null, error: 'Coupon has expired' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.json({ data: null, error: 'Coupon usage limit reached' });
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) return res.json({ data: null, error: `Minimum order ₹${coupon.minOrderAmount} required` });

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    res.json({ data: { coupon, discount: Math.round(discount) }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET all coupons (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ data: coupons, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST create coupon (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ data: coupon, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH update coupon (admin)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ data: coupon, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE coupon (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ data: { message: 'Deleted' }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
