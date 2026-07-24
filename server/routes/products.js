const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/products — list all products (public)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ data: products, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/products/search?q=query — smart multi-field search (public)
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q || q.trim().length < 1) return res.json({ data: [], error: null });

    const term = q.trim();
    // Build regex variants for fuzzy-ish matching
    const regexExact = new RegExp(term, 'i');
    // Split into individual words for multi-word matching
    const words = term.split(/\s+/).filter(w => w.length > 1);
    const wordRegexes = words.map(w => new RegExp(w, 'i'));

    // Score-based: exact match on name gets highest priority
    const [exactMatches, wordMatches] = await Promise.all([
      Product.find({
        $or: [
          { name: regexExact },
          { category: regexExact },
          { description: regexExact },
          { tags: regexExact },
          { keywords: regexExact },
          { color: regexExact },
          { fabric: regexExact },
          { occasion: regexExact },
          { pattern: regexExact },
          { style: regexExact },
        ],
      }).limit(parseInt(limit)).lean(),

      words.length > 1
        ? Product.find({
          $and: wordRegexes.map(wr => ({
            $or: [
              { name: wr }, { category: wr }, { description: wr },
              { tags: wr }, { keywords: wr }, { color: wr },
              { fabric: wr }, { occasion: wr }, { pattern: wr },
            ],
          })),
        }).limit(parseInt(limit)).lean()
        : Promise.resolve([]),
    ]);

    // Merge, deduplicate by _id, exact matches first
    const seen = new Set();
    const results = [];
    [...exactMatches, ...wordMatches].forEach(p => {
      const id = p._id.toString();
      if (!seen.has(id)) { seen.add(id); results.push(p); }
    });

    res.json({ data: results.slice(0, parseInt(limit)), error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/products — create product (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ data: product, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/products/:id — update product (admin only)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: product, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE /api/products/:id — delete product (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: { message: 'Deleted' }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
