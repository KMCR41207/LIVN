const mongoose = require('mongoose');

const addressItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  type: {
    type: String,
    enum: ['Home', 'Office', 'Other'],
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/,
  },
  houseNo: String,
  street: String,
  colony: String,
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
    match: /^[0-9]{6}$/,
  },
  label: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    addresses: [addressItemSchema],
    defaultAddressId: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
  }
);

// Validate addresses array doesn't exceed 10
addressSchema.pre('save', function (next) {
  if (this.addresses.length > 10) {
    return next(new Error('Maximum 10 addresses allowed'));
  }
  next();
});

// Index for faster queries
addressSchema.index({ userId: 1 });

module.exports = mongoose.model('Address', addressSchema);
