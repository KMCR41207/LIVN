/**
 * SessionLog Schema
 * Tracks authentication events for analytics and security monitoring
 * Requirements: 20 (Analytics and Logging)
 */

const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema(
  {
    // User ID (indexed for efficient queries)
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // Event type
    eventType: {
      type: String,
      enum: [
        'login',
        'logout',
        'failed_login',
        'password_reset',
        'password_reset_requested',
        'otp_sent',
        'otp_verified',
        'oauth_login',
        'oauth_link',
        'profile_completed',
        'account_locked',
        'account_unlocked',
      ],
      required: true,
      index: true,
    },

    // IP address of the request
    ipAddress: {
      type: String,
      default: null,
    },

    // User agent string
    userAgent: {
      type: String,
      default: null,
    },

    // Authentication method used
    authMethod: {
      type: String,
      enum: ['email_password', 'google_oauth', 'facebook_oauth', 'phone_otp'],
      default: null,
    },

    // Result of the event
    result: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
      index: true,
    },

    // Error code if failed
    errorCode: {
      type: String,
      default: null,
    },

    // Error message if failed
    errorMessage: {
      type: String,
      default: null,
    },

    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Timestamp of event
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false } // We manage our own timestamp
);

// Compound index for efficient queries by user and timestamp
sessionLogSchema.index({ userId: 1, timestamp: -1 });

// Compound index for event type and result
sessionLogSchema.index({ eventType: 1, result: 1, timestamp: -1 });

// Compound index for finding failed attempts
sessionLogSchema.index({ userId: 1, eventType: 1, result: 1, timestamp: -1 });

// TTL index to automatically delete logs after 90 days for privacy
sessionLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Instance method to get human-readable event description
sessionLogSchema.methods.getDescription = function () {
  const descriptions = {
    login: 'User logged in',
    logout: 'User logged out',
    failed_login: 'Login attempt failed',
    password_reset: 'Password reset successfully',
    password_reset_requested: 'Password reset requested',
    otp_sent: 'OTP sent',
    otp_verified: 'OTP verified',
    oauth_login: 'OAuth login',
    oauth_link: 'OAuth provider linked',
    profile_completed: 'Profile completed',
    account_locked: 'Account locked',
    account_unlocked: 'Account unlocked',
  };

  return descriptions[this.eventType] || 'Unknown event';
};

// Static method to log an authentication event
sessionLogSchema.statics.logEvent = async function (eventData) {
  try {
    const log = new this({
      userId: eventData.userId,
      eventType: eventData.eventType,
      ipAddress: eventData.ipAddress,
      userAgent: eventData.userAgent,
      authMethod: eventData.authMethod,
      result: eventData.result,
      errorCode: eventData.errorCode,
      errorMessage: eventData.errorMessage,
      metadata: eventData.metadata,
      timestamp: new Date(),
    });

    return await log.save();
  } catch (error) {
    console.error('Error logging session event:', error);
    // Don't throw - logging failures should not break the app
    return null;
  }
};

// Static method to get recent events for a user
sessionLogSchema.statics.getRecentEvents = function (userId, limit = 50, daysBack = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  return this.find({
    userId,
    timestamp: { $gte: startDate },
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .exec();
};

// Static method to get failed login attempts for a user
sessionLogSchema.statics.getFailedLoginAttempts = function (userId, minutesBack = 60) {
  const startTime = new Date(Date.now() - minutesBack * 60 * 1000);

  return this.countDocuments({
    userId,
    eventType: 'failed_login',
    result: 'failed',
    timestamp: { $gte: startTime },
  });
};

// Static method to get login analytics
sessionLogSchema.statics.getLoginAnalytics = function (userId, daysBack = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  return this.aggregate([
    {
      $match: {
        userId,
        eventType: { $in: ['login', 'oauth_login'] },
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

module.exports = mongoose.model('SessionLog', sessionLogSchema);
