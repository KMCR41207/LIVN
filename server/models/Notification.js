const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'OrderShipped',
        'OrderDelivered',
        'OrderCancelled',
        'ReturnApproved',
        'ExchangeApproved',
        'CouponAvailable',
        'NewCollection',
        'SaleAlert',
        'AccountUpdate',
        'Other',
      ],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: String,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired notifications
notificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
