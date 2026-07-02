const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // ── Order type ──────────────────────────────────────────────────────
    order_type: { type: String, enum: ['regular', 'bespoke'], default: 'regular' },

    // ── Customer info ───────────────────────────────────────────────────
    customer_name:  { type: String, required: true },
    customer_email: { type: String, default: '' },
    customer_phone: { type: String, default: '' },

    // ── Regular order fields ────────────────────────────────────────────
    product_id:       { type: Number },
    product_name:     { type: String },
    price:            { type: Number },
    shipping_address: { type: String, default: '' },
    measurements:     { type: String, default: '' },
    selected_size:    { type: String, default: 'Standard' },
    quantity:         { type: Number, default: 1 },
    payment_method:   { type: String, default: 'cod' },
    upi_id:           { type: String, default: '' },

    // ── Bespoke order fields ────────────────────────────────────────────
    bespoke_measurements: { type: mongoose.Schema.Types.Mixed, default: null },
    fabric:               { type: mongoose.Schema.Types.Mixed, default: null },
    design:               { type: mongoose.Schema.Types.Mixed, default: null },
    consultation:         { type: mongoose.Schema.Types.Mixed, default: null },
    total_amount:         { type: Number, default: 0 },

    // ── Status ──────────────────────────────────────────────────────────
    status: {
      type: String,
      default: 'New',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
