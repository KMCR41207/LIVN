const mongoose = require('mongoose');

const PO_STATUSES = ['Draft', 'Sent', 'Confirmed', 'Partially Received', 'Received', 'Cancelled'];

const poItemSchema = new mongoose.Schema({
  productId:   { type: String, default: '' },
  productName: { type: String, required: true },
  sku:         { type: String, default: '' },
  quantity:    { type: Number, required: true },
  unitCost:    { type: Number, required: true },
  totalCost:   { type: Number, required: true },
  receivedQty: { type: Number, default: 0 },
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, unique: true },  // PO-2026-0001

  // Supplier
  supplierName:    { type: String, required: true },
  supplierContact: { type: String, default: '' },
  supplierEmail:   { type: String, default: '' },
  supplierAddress: { type: String, default: '' },

  // Items
  items:           { type: [poItemSchema], default: [] },

  // Totals
  totalAmount:     { type: Number, default: 0 },

  // Dates
  expectedDelivery:{ type: Date, default: null },
  receivedDate:    { type: Date, default: null },

  // Status
  status:          { type: String, enum: PO_STATUSES, default: 'Draft' },
  paymentStatus:   { type: String, enum: ['Pending', 'Partial', 'Paid'], default: 'Pending' },

  // Notes
  notes:           { type: String, default: '' },

  // Admin log
  activityLog: [{
    action:    { type: String },
    note:      { type: String, default: '' },
    adminEmail:{ type: String, default: '' },
    date:      { type: Date, default: Date.now },
  }],

  createdBy: { type: String, default: '' },
}, { timestamps: true });

// Auto-generate PO number
purchaseOrderSchema.pre('save', async function (next) {
  if (!this.poNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    this.poNumber = `PO-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
