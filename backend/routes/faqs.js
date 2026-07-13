const express = require('express');
const Faq = require('../models/Faq');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET / — public: list all FAQs sorted by order, then by createdAt
router.get('/', async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ data: faqs, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /:id — public: get single FAQ by id
router.get('/:id', async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json({ data: faq, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST / — admin: create new FAQ
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { question, answer, order } = req.body;

    // Validate required fields
    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ error: 'question is required' });
    }
    if (!answer || typeof answer !== 'string' || answer.trim() === '') {
      return res.status(400).json({ error: 'answer is required' });
    }

    const faq = await Faq.create({ question, answer, order });
    res.status(201).json({ data: faq, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PUT /:id — admin: update FAQ
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json({ data: faq, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE /:id — admin: delete FAQ
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json({ deleted: true });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

module.exports = router;
