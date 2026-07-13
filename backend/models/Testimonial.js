const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    author:  { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    avatar:  { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
