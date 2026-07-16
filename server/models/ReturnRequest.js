const mongoose = require('mongoose');

const RETURN_REASONS = [
  'Wrong Size',
  'Damaged Product',
  'Wrong Item Received',
  'Quality Issue',
  'Changed Mind',
  'Other',
];

const RETURN_STATUSES = [
  'Return Requested',
  'Under Review',
  'Approved',
  'Rejected',
  'More Info Requested',
  'Pickup Scheduled',
  'Received',
  'Refund Initiated',
  'Completed',
];

const returnRequestSchema = new mongoose.Schema({
  orderId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderRef:     { type: String, default: '' },   // human-readable order ID slice

  // Customer info (denormalised)
  customerName:  { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, default: '' },

  // What is being returned
  productName:   { type: String, required: true },
  productId:     { type: String, default: '' },
  quantity:      { type: Number, default: 1 },

  // Return details
  reason:      { type: String, enum: RETURN_REASONS, required: true },
  comments:    { type: String, default: '' },
  images:      { type: [String], default: [] },  // base64 or URLs

  status:      { type: String, enum: RETURN_STATUSES, default: 'Return Requested' },

  // Refund
  refundAmount:  { type: Number, default: 0 },
  refundMethod:  { type: String, default: '' },

  // Admin activity log
  activityLog: [{
    status:    { type: String },
    note:      { type: String, default: '' },
    adminEmail:{ type: String, default: '' },
    date:      { type: Date, default: Date.now },
  }],

  // Admin fields
  adminNote:   { type: String, default: '' },
  resolvedAt:  { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
