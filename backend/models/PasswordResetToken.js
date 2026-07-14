/**
 * PasswordResetToken Schema
 * Stores password reset tokens with TTL index and one-time use enforcement
 * Requirements: 9.5-9.9
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema(
  {
    // Secure reset token
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Hashed version of token for extra security (optional)
    tokenHash: {
      type: String,
      required: true,
      index: true,
      sparse: true,
    },

    // User ID who requested the reset
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // User email (for reference and verification)
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    // Expiration timestamp (1 hour from creation)
    // TTL index automatically deletes after expiry
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    // Timestamp when token was used (prevents reuse)
    usedAt: {
      type: Date,
      default: null,
    },

    // Timestamp when token was created
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // IP address where reset was requested
    requestFromIP: {
      type: String,
      default: null,
    },

    // User agent where reset was requested
    requestFromUserAgent: {
      type: String,
      default: null,
    },
  },
  { timestamps: false } // Don't auto-add timestamps since we manage them
);

// TTL Index: automatically delete documents when expiresAt timestamp is reached
// expireAfterSeconds: 0 means delete immediately when current time >= expiresAt
// This ensures expired reset tokens are automatically cleaned up
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient queries by userId and expiresAt
passwordResetTokenSchema.index({ userId: 1, expiresAt: 1 });

// Index for finding active (unused) tokens
passwordResetTokenSchema.index({ userId: 1, usedAt: 1, expiresAt: 1 });

// Instance method to check if token is still valid and unused
passwordResetTokenSchema.methods.isValid = function () {
  const now = new Date();
  // Token is valid if:
  // 1. Not used yet (usedAt is null)
  // 2. Not expired (expiresAt > now)
  return !this.usedAt && this.expiresAt > now;
};

// Instance method to mark token as used
passwordResetTokenSchema.methods.markAsUsed = function () {
  this.usedAt = new Date();
  return this.save();
};

// Static method to generate a new reset token
passwordResetTokenSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString('hex');
};

// Static method to hash token
passwordResetTokenSchema.statics.hashToken = function (token) {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Static method to find and validate a token
passwordResetTokenSchema.statics.findValidToken = async function (token) {
  const tokenHash = this.hashToken(token);
  const record = await this.findOne({ tokenHash });

  if (!record) {
    return null;
  }

  // Check if token is still valid
  if (!record.isValid()) {
    return null;
  }

  return record;
};

// Static method to clean up expired tokens (though TTL handles this)
passwordResetTokenSchema.statics.deleteExpired = function () {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

// Static method to revoke all unused reset tokens for a user
passwordResetTokenSchema.statics.revokeAllForUser = function (userId) {
  return this.updateMany(
    { userId, usedAt: null },
    { usedAt: new Date() }
  );
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
