const express = require('express');
const SavedMeasurement = require('../models/SavedMeasurement');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

/**
 * GET /api/measurements
 * Get all saved measurements for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    let doc = await SavedMeasurement.findOne({ userId: req.user.id });
    if (!doc) {
      doc = await SavedMeasurement.create({ userId: req.user.id, measurements: [] });
    }
    return res.json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * POST /api/measurements
 * Add a new measurement profile
 */
router.post('/', async (req, res) => {
  try {
    const { name, bust, waist, hips, length, shoulder, sleeve, notes } = req.body;
    if (!name || bust == null || waist == null || hips == null) {
      return res.status(400).json({ data: null, error: 'name, bust, waist, hips are required' });
    }

    let doc = await SavedMeasurement.findOne({ userId: req.user.id });
    if (!doc) doc = await SavedMeasurement.create({ userId: req.user.id, measurements: [] });

    doc.measurements.push({ name, bust, waist, hips, length, shoulder, sleeve, notes });
    await doc.save();

    return res.status(201).json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * PATCH /api/measurements/:measurementId
 * Update a measurement profile
 */
router.patch('/:measurementId', async (req, res) => {
  try {
    const doc = await SavedMeasurement.findOne({ userId: req.user.id });
    if (!doc) return res.status(404).json({ data: null, error: 'No measurements found' });

    const profile = doc.measurements.id(req.params.measurementId);
    if (!profile) return res.status(404).json({ data: null, error: 'Measurement profile not found' });

    Object.assign(profile, req.body);
    await doc.save();

    return res.json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * DELETE /api/measurements/:measurementId
 * Delete a measurement profile
 */
router.delete('/:measurementId', async (req, res) => {
  try {
    const doc = await SavedMeasurement.findOne({ userId: req.user.id });
    if (!doc) return res.status(404).json({ data: null, error: 'No measurements found' });

    const profile = doc.measurements.id(req.params.measurementId);
    if (!profile) return res.status(404).json({ data: null, error: 'Measurement profile not found' });

    profile.deleteOne();
    await doc.save();

    return res.json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

/**
 * PATCH /api/measurements/:measurementId/default
 * Set a measurement profile as the default
 */
router.patch('/:measurementId/default', async (req, res) => {
  try {
    const doc = await SavedMeasurement.findOne({ userId: req.user.id });
    if (!doc) return res.status(404).json({ data: null, error: 'No measurements found' });

    const profile = doc.measurements.id(req.params.measurementId);
    if (!profile) return res.status(404).json({ data: null, error: 'Measurement profile not found' });

    doc.defaultMeasurementId = profile._id;
    await doc.save();

    return res.json({ data: doc, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
