const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:             { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType:     { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue:    { type: Number, required: true },
  minOrderAmount:   { type: Number, default: 0 },
  maxDiscount:      { type: Number, default: null },
  startDate:        { type: Date, default: Date.now },
  expiryDate:       { type: Date, default: null },
  usageLimit:       { type: Number, default: null },
  perUserLimit:     { type: Number, default: 1 },
  usedCount:        { type: Number, default: 0 },
  isActive:         { type: Boolean, default: true },
  description:      { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
