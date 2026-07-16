const mongoose = require('mongoose');

// Auto-generate sequential invoice numbers: LIV-2026-000001
const invoiceItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  sku:         { type: String, default: '' },
  quantity:    { type: Number, required: true, default: 1 },
  unitPrice:   { type: Number, required: true },
  discount:    { type: Number, default: 0 },     // rupee amount
  gstPercent:  { type: Number, default: 5 },      // 5% for garments
  taxAmount:   { type: Number, default: 0 },
  total:       { type: Number, required: true },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },  // LIV-2026-000123
  orderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },

  // Seller details (Livaani)
  sellerName:    { type: String, default: 'Livaani' },
  sellerGSTIN:   { type: String, default: '' },
  sellerAddress: { type: String, default: '' },
  sellerPhone:   { type: String, default: '' },
  sellerEmail:   { type: String, default: '' },

  // Customer details (from order)
  customerName:    { type: String, required: true },
  customerEmail:   { type: String, default: '' },
  customerPhone:   { type: String, default: '' },
  billingAddress:  { type: String, default: '' },
  shippingAddress: { type: String, default: '' },

  // Order summary
  invoiceDate:    { type: Date, default: Date.now },
  paymentMethod:  { type: String, default: 'cod' },
  orderStatus:    { type: String, default: 'New' },

  // Line items
  items: { type: [invoiceItemSchema], default: [] },

  // Totals
  subtotal:        { type: Number, default: 0 },
  discountAmount:  { type: Number, default: 0 },
  shippingCharge:  { type: Number, default: 0 },
  cgst:            { type: Number, default: 0 },
  sgst:            { type: Number, default: 0 },
  igst:            { type: Number, default: 0 },
  grandTotal:      { type: Number, required: true },

  // Flags
  isInterState:    { type: Boolean, default: false },  // IGST vs CGST+SGST
  status:          { type: String, enum: ['generated', 'sent', 'cancelled'], default: 'generated' },

  // Admin log
  activityLog: [{
    action:    { type: String },
    note:      { type: String, default: '' },
    adminEmail:{ type: String, default: '' },
    date:      { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Pre-save: auto-generate invoice number
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `LIV-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
