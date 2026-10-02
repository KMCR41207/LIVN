const express = require('express');
const RecentlyViewed = require('../models/RecentlyViewed');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

/**
 * GET /api/recently-viewed
 * Get recently viewed products for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const doc = await RecentlyViewed.findOne({ userId: req.user.id })
      .populate('products.productId', 'name price offer_price images');

    if (!doc) return res.json({ data: { products: [] }, error: null });

    const sorted = [...doc.products].sort((a, b) => b.viewedAt - a.viewedAt);
    return res.json({ data: { products: sorted }, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * POST /api/recently-viewed
 * Record a product view
 */
router.post('/', async (req, res) => {
  try {
    const { productId, name, price, image } = req.body;
    if (!productId || !price) {
      return res.status(400).json({ data: null, error: 'productId and price are required' });
    }

    let doc = await RecentlyViewed.findOne({ userId: req.user.id });
    if (!doc) {
      doc = await RecentlyViewed.create({ userId: req.user.id, products: [] });
    }

    const existing = doc.products.find(p => p.productId.toString() === productId);
    if (existing) {
      existing.viewedAt = new Date();
      existing.viewedCount += 1;
      if (name) existing.name = name;
      if (image) existing.image = image;
    } else {
      doc.products.push({ productId, name, price, image, viewedAt: new Date() });
    }

    await doc.save();
    return res.status(201).json({ data: { message: 'View recorded' }, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * DELETE /api/recently-viewed/:productId
 * Remove a product from recently viewed
 */
router.delete('/:productId', async (req, res) => {
  try {
    const doc = await RecentlyViewed.findOne({ userId: req.user.id });
    if (!doc) return res.status(404).json({ data: null, error: 'No recently viewed found' });

    doc.products = doc.products.filter(p => p.productId.toString() !== req.params.productId);
    await doc.save();

    return res.json({ data: { message: 'Product removed from recently viewed' }, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * DELETE /api/recently-viewed
 * Clear all recently viewed products
 */
router.delete('/', async (req, res) => {
  try {
    await RecentlyViewed.findOneAndUpdate(
      { userId: req.user.id },
      { products: [], lastViewed: new Date() }
    );
    return res.json({ data: { message: 'Recently viewed cleared' }, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
