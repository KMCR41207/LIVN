const mongoose = require('mongoose');

const EXCHANGE_TYPES = ['Size Exchange', 'Color Exchange', 'Product Exchange'];
const EXCHANGE_STATUSES = [
  'Exchange Requested',
  'Under Review',
  'Approved',
  'Rejected',
  'Pickup Scheduled',
  'Replacement Stitching',
  'Dispatched',
  'Completed',
];

const exchangeRequestSchema = new mongoose.Schema({
  orderId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderRef:     { type: String, default: '' },

  // Customer (denormalised)
  customerName:  { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, default: '' },

  // Original item
  productName:     { type: String, required: true },
  productId:       { type: String, default: '' },
  originalSize:    { type: String, default: '' },
  originalColor:   { type: String, default: '' },

  // Exchange details
  exchangeType:  { type: String, enum: EXCHANGE_TYPES, required: true },
  newSize:       { type: String, default: '' },
  newColor:      { type: String, default: '' },
  newProductName:{ type: String, default: '' },  // for product exchange
  reason:        { type: String, required: true },
  notes:         { type: String, default: '' },

  status: { type: String, enum: EXCHANGE_STATUSES, default: 'Exchange Requested' },

  // Admin activity log
  activityLog: [{
    status:    { type: String },
    note:      { type: String, default: '' },
    adminEmail:{ type: String, default: '' },
    date:      { type: Date, default: Date.now },
  }],

  adminNote:  { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
