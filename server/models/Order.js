const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  note:      { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false });

const productSnapshotSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
  offerPrice: Number,
  quantity: Number,
  size: String,
  image: String,
  measurements: String,
}, { _id: false });

const addressSnapshotSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  houseNo: String,
  street: String,
  colony: String,
  city: String,
  state: String,
  pincode: String,
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    // Link to user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    
    // Unique order identifier
    orderId: {
      type: String,
      unique: true,
      index: true,
    },
    
    // Customer snapshot at order time
    customerSnapshot: {
      name: String,
      email: String,
      phone: String,
    },
    
    // Products ordered
    products: [productSnapshotSchema],
    
    // Pricing
    subtotal: Number,
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    
    // Addresses
    shippingAddress: addressSnapshotSchema,
    billingAddress: addressSnapshotSchema,
    
    // Payment
    paymentMethod: {
      type: String,
      enum: ['cod', 'upi', 'card'],
      default: 'cod',
    },
    upiId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    
    // Order details
    status: {
      type: String,
      enum: ['New', 'Confirmed', 'Processing', 'Stitching', 'Ready', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'New',
      index: true,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    
    // Notes
    orderNotes: String,
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
    internalNotes: String,
    
    // Legacy fields (for backward compatibility)
    product_id:       { type: String, default: '' },
    product_name:     { type: String },
    price:            { type: Number },
    customer_name:    { type: String },
    customer_phone:   { type: String },
    customer_email:   { type: String },
    shipping_address: { type: String },
    measurements:     { type: String },
    selected_size:    { type: String },
    quantity:         { type: Number },
    payment_method:   { type: String },
    upi_id:           { type: String },
    order_notes:      { type: String },
    coupon_code:      { type: String },
    discount_amount:  { type: Number },
    
    // Invoice
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    invoiceUrl: String,
    
    // Tracking
    trackingNumber: String,
    estimatedDelivery: Date,
    
    // Never soft delete - permanent storage
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ customer_email: 1 });
orderSchema.index({ createdAt: -1 });

// Auto-generate orderId if not provided
orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    // Generate unique orderId: LIV-20260718-XXXXX
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.orderId = `LIV-${dateStr}-${random}`;
  }
  
  // Initialize statusHistory if empty
  if (this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      note: 'Order created',
      updatedAt: new Date(),
    });
  }
  
  next();
});

module.exports = mongoose.model('Order', orderSchema);
