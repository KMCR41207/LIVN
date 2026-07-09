const express = require('express');
const Discount = require('../models/Discount');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET all discounts (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json({ data: discounts, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST create discount (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const discount = await Discount.create(req.body);
    res.status(201).json({ data: discount, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH update discount (admin)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!discount) return res.status(404).json({ error: 'Discount not found' });
    res.json({ data: discount, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE discount (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ data: { message: 'Deleted' }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
