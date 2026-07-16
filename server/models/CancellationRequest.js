const mongoose = require('mongoose');

const CANCELLATION_STATUSES = [
  'Requested',
  'Under Review',
  'Approved',
  'Rejected',
  'Refund Processing',
  'Completed',
];

const CANCELLATION_REASONS = [
  'Changed Mind',
  'Found Better Price',
  'Ordered by Mistake',
  'Delivery Too Slow',
  'Payment Issue',
  'Other',
];

const cancellationRequestSchema = new mongoose.Schema({
  orderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderRef:    { type: String, default: '' },

  // Customer (denormalised)
  customerName:  { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, default: '' },

  // Order details
  productName:   { type: String, required: true },
  productId:     { type: String, default: '' },
  orderAmount:   { type: Number, default: 0 },
  orderStatus:   { type: String, default: '' },  // status at time of cancellation request

  // Cancellation details
  reason:        { type: String, enum: CANCELLATION_REASONS, required: true },
  comments:      { type: String, default: '' },

  status:        { type: String, enum: CANCELLATION_STATUSES, default: 'Requested' },

  // Eligibility
  isEligible:    { type: Boolean, default: true },
  ineligibleReason: { type: String, default: '' },  // e.g. "Stitching already started"

  // Refund
  refundAmount:  { type: Number, default: 0 },
  refundMethod:  { type: String, default: '' },

  // Admin
  adminNote:     { type: String, default: '' },
  adminOverride: { type: Boolean, default: false },  // admin can override eligibility

  activityLog: [{
    status:    { type: String },
    note:      { type: String, default: '' },
    adminEmail:{ type: String, default: '' },
    date:      { type: Date, default: Date.now },
  }],

  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('CancellationRequest', cancellationRequestSchema);
