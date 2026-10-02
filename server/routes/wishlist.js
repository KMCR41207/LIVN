const express = require('express');
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

/**
 * GET /api/wishlist
 * Get the authenticated user's wishlist
 */
router.get('/', async (req, res) => {
  try {
    let doc = await Wishlist.findOne({ userId: req.user.id })
      .populate('products.productId', 'name price offer_price images');

    if (!doc) {
      doc = await Wishlist.create({ userId: req.user.id, products: [] });
    }

    return res.json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * POST /api/wishlist
 * Add a product to the wishlist
 */
router.post('/', async (req, res) => {
  try {
    const { productId, name, price, image, notes } = req.body;
    if (!productId || price == null) {
      return res.status(400).json({ data: null, error: 'productId and price are required' });
    }

    let doc = await Wishlist.findOne({ userId: req.user.id });
    if (!doc) doc = await Wishlist.create({ userId: req.user.id, products: [] });

    const alreadyIn = doc.products.some(p => p.productId.toString() === productId);
    if (alreadyIn) {
      return res.status(409).json({ data: null, error: 'Product already in wishlist' });
    }

    doc.products.push({ productId, name, price, image, notes });
    await doc.save();

    return res.status(201).json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * DELETE /api/wishlist/:productId
 * Remove a product from the wishlist
 */
router.delete('/:productId', async (req, res) => {
  try {
    const doc = await Wishlist.findOne({ userId: req.user.id });
    if (!doc) return res.status(404).json({ data: null, error: 'Wishlist not found' });

    const before = doc.products.length;
    doc.products = doc.products.filter(p => p.productId.toString() !== req.params.productId);

    if (doc.products.length === before) {
      return res.status(404).json({ data: null, error: 'Product not found in wishlist' });
    }

    await doc.save();
    return res.json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * DELETE /api/wishlist
 * Clear the entire wishlist
 */
router.delete('/', async (req, res) => {
  try {
    const doc = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { products: [] },
      { new: true }
    );
    return res.json({ data: { message: 'Wishlist cleared', doc }, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
