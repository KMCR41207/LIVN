const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  action:    { type: String, enum: ['added', 'removed', 'reserved', 'released', 'set'], required: true },
  quantity:  { type: Number, required: true },
  prevStock: { type: Number, required: true },
  newStock:  { type: Number, required: true },
  note:      { type: String, default: '' },
  adminEmail:{ type: String, default: '' },
  date:      { type: Date, default: Date.now },
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    category:    { type: String, required: true, trim: true },
    price:       { type: Number, required: true },
    offer_price: { type: Number, default: null },
    image:       { type: String, default: '' },
    images:      { type: [String], default: [] },
    description: { type: String, default: '' },

    // ─── Inventory fields ───────────────────────────────────────────────
    sku:               { type: String, default: '' },
    stock:             { type: Number, default: 0 },
    reservedStock:     { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    trackInventory:    { type: Boolean, default: true },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
    },
    stockHistory:    { type: [stockHistorySchema], default: [] },
    lastStockUpdate: { type: Date, default: null },
    notifyMeEmails:  { type: [String], default: [] },
  },
  { timestamps: true }
);

// Auto-compute stockStatus before every save
productSchema.pre('save', function (next) {
  if (this.trackInventory) {
    const avail = this.stock - this.reservedStock;
    if (avail <= 0) this.stockStatus = 'out_of_stock';
    else if (avail <= this.lowStockThreshold) this.stockStatus = 'low_stock';
    else this.stockStatus = 'in_stock';
  }
  next();
});

// Virtual: availableStock = stock - reservedStock
productSchema.virtual('availableStock').get(function () {
  return Math.max(0, this.stock - this.reservedStock);
});
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
