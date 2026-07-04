const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    category:    { type: String, required: true, trim: true },
    price:       { type: Number, required: true },
    offer_price: { type: Number, default: null },
    image:       { type: String, default: '' },
    images:      { type: [String], default: [] },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
