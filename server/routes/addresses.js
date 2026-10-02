const express = require('express');
const Address = require('../models/Address');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

/**
 * GET /api/addresses
 * Get all addresses for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    let doc = await Address.findOne({ userId: req.user.id });
    if (!doc) {
      doc = await Address.create({ userId: req.user.id, addresses: [] });
    }
    return res.json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * POST /api/addresses
 * Add a new address
 */
router.post('/', async (req, res) => {
  try {
    const { type, fullName, phone, houseNo, street, colony, city, state, pincode, label } = req.body;
    if (!type || !fullName || !phone || !city || !state || !pincode) {
      return res.status(400).json({ data: null, error: 'type, fullName, phone, city, state, pincode are required' });
    }

    let doc = await Address.findOne({ userId: req.user.id });
    if (!doc) doc = await Address.create({ userId: req.user.id, addresses: [] });

    doc.addresses.push({ type, fullName, phone, houseNo, street, colony, city, state, pincode, label });
    await doc.save();

    return res.status(201).json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * PATCH /api/addresses/:addressId
 * Update an existing address
 */
router.patch('/:addressId', async (req, res) => {
  try {
    const doc = await Address.findOne({ userId: req.user.id });
    if (!doc) return res.status(404).json({ data: null, error: 'No addresses found' });

    const addr = doc.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ data: null, error: 'Address not found' });

    Object.assign(addr, req.body);
    await doc.save();

    return res.json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * DELETE /api/addresses/:addressId
 * Remove an address
 */
router.delete('/:addressId', async (req, res) => {
  try {
    const doc = await Address.findOne({ userId: req.user.id });
    if (!doc) return res.status(404).json({ data: null, error: 'No addresses found' });

    const addr = doc.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ data: null, error: 'Address not found' });

    addr.deleteOne();
    await doc.save();

    return res.json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * PATCH /api/addresses/:addressId/default
 * Set an address as the default
 */
router.patch('/:addressId/default', async (req, res) => {
  try {
    const doc = await Address.findOne({ userId: req.user.id });
    if (!doc) return res.status(404).json({ data: null, error: 'No addresses found' });

    const addr = doc.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ data: null, error: 'Address not found' });

    doc.defaultAddressId = addr._id;
    await doc.save();

    return res.json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
