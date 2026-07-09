const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  description:    { type: String, default: '' },
  type:           {
    type: String,
    enum: ['store-wide', 'category', 'product', 'buy-x-get-y', 'free-shipping', 'festival', 'flash-sale', 'limited-time'],
    required: true
  },
  discountType:   { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue:  { type: Number, required: true },
  applicableTo:   { type: String, default: '' }, // category name or product name
  minOrderAmount: { type: Number, default: 0 },
  buyQuantity:    { type: Number, default: null }, // for buy-x-get-y
  getQuantity:    { type: Number, default: null }, // for buy-x-get-y
  startDate:      { type: Date, default: Date.now },
  endDate:        { type: Date, default: null },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Discount', discountSchema);
