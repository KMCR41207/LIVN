const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  note:      { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    product_id:       { type: String, default: '' },
    product_name:     { type: String, required: true },
    price:            { type: Number, required: true },
    customer_name:    { type: String, required: true },
    customer_phone:   { type: String, required: true },
    customer_email:   { type: String, default: '' },
    shipping_address: { type: String, required: true },
    measurements:     { type: String, default: '' },
    selected_size:    { type: String, default: 'Standard' },
    quantity:         { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['New', 'Sent', 'Stitching', 'Ready', 'Delivered'],
      default: 'New',
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    payment_method: { type: String, default: 'cod' },
    upi_id:         { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
