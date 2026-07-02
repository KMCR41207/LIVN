const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    category:    { type: String, required: true, trim: true },
    price:       { type: Number, required: true },
    offer_price: { type: Number, default: null },
    image:       { type: String, default: '' },
    description: { type: String, default: '' },
    available:   { type: Boolean, default: true },
    sizes:       { type: [String], default: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    tags:        { type: [String], default: [] },
    created_by:  { type: String, default: 'admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
