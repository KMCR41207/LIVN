const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  price: {
    type: Number,
    required: true,
  },
  offerPrice: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: String,
  image: String,
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate subtotal before saving
cartSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, item) => {
    const price = item.offerPrice || item.price;
    return sum + price * item.quantity;
  }, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
