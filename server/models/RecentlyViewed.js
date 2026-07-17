const mongoose = require('mongoose');

const viewedProductSchema = new mongoose.Schema({
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
  image: String,
  viewedAt: {
    type: Date,
    default: Date.now,
  },
  viewedCount: {
    type: Number,
    default: 1,
  },
});

const recentlyViewedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    products: [viewedProductSchema],
    lastViewed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Keep only latest 100 products
recentlyViewedSchema.pre('save', function (next) {
  if (this.products.length > 100) {
    // Sort by viewedAt descending and keep only top 100
    this.products = this.products
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, 100);
  }
  this.lastViewed = new Date();
  next();
});

// Index for faster queries
recentlyViewedSchema.index({ userId: 1, 'products.viewedAt': -1 });

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema);
