/**
 * RefreshToken Schema
 * Stores refresh tokens with TTL index for automatic expiration
 * Requirements: 8.3, 8.8
 */

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    // The actual JWT refresh token
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // User ID associated with this token
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // Expiration timestamp (TTL index deletes automatically)
    // Set to 30 days from creation
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    // Timestamp when token was created
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Timestamp when token was revoked (null if active)
    revokedAt: {
      type: Date,
      default: null,
    },

    // IP address where token was created (for audit trail)
    createdFromIP: {
      type: String,
      default: null,
    },

    // User agent where token was created (for audit trail)
    createdFromUserAgent: {
      type: String,
      default: null,
    },
  },
  { timestamps: false } // Don't auto-add timestamps since we manage them
);

// TTL Index: automatically delete documents when expiresAt timestamp is reached
// expireAfterSeconds: 0 means delete immediately when current time >= expiresAt
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient queries filtering by user and expiration
refreshTokenSchema.index({ userId: 1, expiresAt: 1 });

// Index for finding active (non-revoked) tokens
refreshTokenSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

// Instance method to check if token is still valid
refreshTokenSchema.methods.isValid = function () {
  const now = new Date();
  // Token is valid if not revoked and not expired
  return !this.revokedAt && this.expiresAt > now;
};

// Instance method to revoke token
refreshTokenSchema.methods.revoke = function () {
  this.revokedAt = new Date();
  return this.save();
};

// Static method to clean up expired tokens (though TTL handles this)
refreshTokenSchema.statics.deleteExpired = function () {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllForUser = function (userId) {
  return this.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() }
  );
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
