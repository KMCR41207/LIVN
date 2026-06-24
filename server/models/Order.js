const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    product_id:       { type: Number, required: true },
    product_name:     { type: String, required: true },
    price:            { type: Number, required: true },
    customer_name:    { type: String, required: true },
    customer_phone:   { type: String, required: true },
    customer_email:   { type: String, default: '' },
    shipping_address: { type: String, required: true },
    measurements:     { type: String, default: '' },
    selected_size:    { type: String, default: 'Standard' },
    status: {
      type: String,
      enum: ['New', 'Sent', 'Stitching', 'Ready', 'Delivered'],
      default: 'New',
    },
    payment_method: { type: String, default: 'cod' },
    upi_id:         { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
