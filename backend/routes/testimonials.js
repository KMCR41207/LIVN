const express = require('express');
const Testimonial = require('../models/Testimonial');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET / — public: list all testimonials sorted by createdAt descending
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ data: testimonials, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /:id — public: get single testimonial by id
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json({ data: testimonial, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST / — admin: create new testimonial
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { author, content, rating, avatar } = req.body;

    // Validate required fields
    if (!author || typeof author !== 'string' || author.trim() === '') {
      return res.status(400).json({ error: 'author is required' });
    }
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: 'content is required' });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be a number between 1 and 5' });
    }

    const testimonial = await Testimonial.create({ author, content, rating, avatar });
    res.status(201).json({ data: testimonial, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PUT /:id — admin: update testimonial
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!testimonial) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json({ data: testimonial, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE /:id — admin: delete testimonial
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json({ deleted: true });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
