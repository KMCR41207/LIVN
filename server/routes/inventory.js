const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/inventory/summary — dashboard stat cards
router.get('/summary', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({});
    const totalProducts  = products.length;
    const totalStock     = products.reduce((s, p) => s + (p.stock || 0), 0);
    const reservedStock  = products.reduce((s, p) => s + (p.reservedStock || 0), 0);
    const lowStockCount  = products.filter(p => p.stockStatus === 'low_stock').length;
    const outOfStockCount= products.filter(p => p.stockStatus === 'out_of_stock').length;
    const totalValue     = products.reduce((s, p) => s + ((p.offer_price || p.price) * (p.stock || 0)), 0);
    res.json({ data: { totalProducts, totalStock, reservedStock, lowStockCount, outOfStockCount, totalValue }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/inventory/low-stock
router.get('/low-stock', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({ stockStatus: 'low_stock' }).sort({ stock: 1 });
    res.json({ data: products, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/inventory/out-of-stock
router.get('/out-of-stock', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({ stockStatus: 'out_of_stock' }).sort({ name: 1 });
    res.json({ data: products, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/inventory — all products with inventory data
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({ data: products, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/inventory/:id/history — stock movement log for a product
router.get('/:id/history', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('name sku stockHistory');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const history = [...product.stockHistory].reverse(); // newest first
    res.json({ data: { name: product.name, sku: product.sku, history }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/inventory/:id/stock — update stock (add / remove / set)
router.patch('/:id/stock', protect, adminOnly, async (req, res) => {
  try {
    const { action, quantity, note } = req.body;
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) return res.status(400).json({ error: 'Quantity must be a positive number' });
    if (!['add', 'remove', 'set'].includes(action))
      return res.status(400).json({ error: 'Action must be: add, remove, or set' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const prevStock = product.stock;
    let newStock;

    if (action === 'add') {
      newStock = prevStock + qty;
    } else if (action === 'remove') {
      const available = product.stock - product.reservedStock;
      if (qty > available)
        return res.status(400).json({ error: `Only ${available} units available (rest are reserved)` });
      newStock = prevStock - qty;
    } else {
      // set
      newStock = qty;
    }

    const historyAction = action === 'add' ? 'added' : action === 'remove' ? 'removed' : 'set';

    product.stock = newStock;
    product.lastStockUpdate = new Date();
    product.stockHistory.push({
      action: historyAction,
      quantity: qty,
      prevStock,
      newStock,
      note: note || '',
      adminEmail: req.user?.email || 'admin',
    });

    await product.save(); // pre-save hook updates stockStatus
    res.json({ data: product, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/inventory/reserve — reserve stock when order is placed
router.post('/reserve', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.reservedStock = (product.reservedStock || 0) + qty;
    product.stockHistory.push({
      action: 'reserved', quantity: qty,
      prevStock: product.stock, newStock: product.stock,
      note: 'Reserved for order',
    });
    await product.save();
    res.json({ data: product, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/inventory/release — release reserved stock on cancel/deliver
router.post('/release', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.reservedStock = Math.max(0, (product.reservedStock || 0) - qty);
    product.stockHistory.push({
      action: 'released', quantity: qty,
      prevStock: product.stock, newStock: product.stock,
      note: 'Released from order',
    });
    await product.save();
    res.json({ data: product, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/inventory/:id/notify-me — public: save email for restock notification
router.post('/:id/notify-me', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    await Product.findByIdAndUpdate(req.params.id, { $addToSet: { notifyMeEmails: email } });
    res.json({ data: { message: 'You will be notified when back in stock' }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
