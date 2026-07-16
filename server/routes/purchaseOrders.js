const express = require('express');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product       = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/purchase-orders — all POs (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const pos = await PurchaseOrder.find().sort({ createdAt: -1 });
    res.json({ data: pos, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/purchase-orders/:id
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ error: 'Purchase order not found' });
    res.json({ data: po, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/purchase-orders — create PO (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { items, ...rest } = req.body;
    // Calculate total
    const totalAmount = (items || []).reduce((sum, item) => sum + (item.totalCost || 0), 0);
    const po = await PurchaseOrder.create({
      ...rest,
      items: items || [],
      totalAmount,
      createdBy: req.user?.email || 'admin',
      activityLog: [{ action: 'Created', note: 'Purchase order created', adminEmail: req.user?.email || 'admin' }],
    });
    res.status(201).json({ data: po, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/purchase-orders/:id — update PO (admin)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { note, items, ...rest } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ error: 'Purchase order not found' });

    if (items) {
      po.items = items;
      po.totalAmount = items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
    }
    Object.assign(po, rest);
    po.activityLog.push({ action: 'Updated', note: note || 'PO updated', adminEmail: req.user?.email || 'admin' });
    await po.save();
    res.json({ data: po, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE /api/purchase-orders/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.json({ data: { message: 'Deleted' }, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/purchase-orders/:id/receive — mark stock as received, update inventory
router.post('/:id/receive', protect, adminOnly, async (req, res) => {
  try {
    const { itemUpdates, note } = req.body;
    // itemUpdates: [{ productId, sku, receivedQty }]
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ error: 'Purchase order not found' });

    let allReceived = true;
    let anyReceived = false;

    for (const update of (itemUpdates || [])) {
      const item = po.items.find(i => i.sku === update.sku || i.productId === update.productId);
      if (!item) continue;
      item.receivedQty = (item.receivedQty || 0) + (update.receivedQty || 0);
      if (item.receivedQty < item.quantity) allReceived = false;
      else anyReceived = true;

      // Update inventory if productId is provided
      if (update.productId && update.receivedQty > 0) {
        try {
          const product = await Product.findById(update.productId);
          if (product) {
            const qty = update.receivedQty;
            product.stock = (product.stock || 0) + qty;
            product.stockHistory.push({
              action: 'added', quantity: qty,
              prevStock: product.stock - qty, newStock: product.stock,
              note: `Received from PO ${po.poNumber}`,
            });
            await product.save();
          }
        } catch { /* non-critical */ }
      }
    }

    po.status = allReceived ? 'Received' : (anyReceived ? 'Partially Received' : po.status);
    if (allReceived) po.receivedDate = new Date();
    po.activityLog.push({ action: 'Stock Received', note: note || 'Stock received and inventory updated', adminEmail: req.user?.email || 'admin' });
    await po.save();
    res.json({ data: po, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /api/purchase-orders/summary/stats — KPI summary
router.get('/summary/stats', protect, adminOnly, async (req, res) => {
  try {
    const all = await PurchaseOrder.find();
    const stats = {
      total: all.length,
      draft:     all.filter(p => p.status === 'Draft').length,
      active:    all.filter(p => ['Sent', 'Confirmed', 'Partially Received'].includes(p.status)).length,
      received:  all.filter(p => p.status === 'Received').length,
      cancelled: all.filter(p => p.status === 'Cancelled').length,
      totalValue: all.reduce((s, p) => s + (p.totalAmount || 0), 0),
    };
    res.json({ data: stats, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
