const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/products — public, list all available products
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ data: products, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/products/:id — public, single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: product, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/products — admin only, create new product
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      name, category, price, offer_price,
      image, description, available, sizes, tags
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'name, category, and price are required' });
    }

    const product = await Product.create({
      name,
      category,
      price,
      offer_price: offer_price || null,
      image: image || '',
      description: description || '',
      available: available !== undefined ? available : true,
      sizes: sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      tags: tags || [],
      created_by: req.user.email,
    });

    res.status(201).json({ data: product, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/products/:id — admin only, update product
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: product, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE /api/products/:id — admin only, delete product
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: { deleted: true }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
