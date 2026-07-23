const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // User who posted the review
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Order being reviewed
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    // Product being reviewed (for quick reference)
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },

    // Product info snapshot
    productName: {
      type: String,
      required: true,
    },

    // Star rating 1-5
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Review text
    review: {
      type: String,
      required: true,
      maxlength: 500,
    },

    // Uploaded images (array of file paths/URLs)
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 5; // Max 5 images
        },
        message: 'Maximum 5 images allowed',
      },
    },

    // Helpful count
    helpfulCount: {
      type: Number,
      default: 0,
    },

    // Unhelpful count
    unhelpfulCount: {
      type: Number,
      default: 0,
    },

    // Admin moderation status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },

    // Admin rejection reason (if any)
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Ensure one review per order
reviewSchema.index({ userId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
