/**
 * User Schema
 * Comprehensive user model supporting email/password and OAuth authentication
 * Requirements: 7.1, 7.6, 18.1-18.7
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    // Unique identifier (UUID v4)
    userId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
      required: true,
    },

    // Email (unique, indexed)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      sparse: false,
    },

    // Phone number (indexed, optional)
    phone: {
      type: String,
      index: true,
      sparse: true,
      default: null,
    },

    // Personal information
    firstName: {
      type: String,
      default: null,
    },

    lastName: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },

    // Password hash (optional for OAuth users)
    // Using salt factor 10 with bcryptjs (Requirement 7.2)
    passwordHash: {
      type: String,
      default: null,
    },

    // Legacy password field (for backward compatibility)
    password: {
      type: String,
      default: null,
    },

    // OAuth providers linked to this account
    oauthProviders: [
      {
        provider: {
          type: String,
          enum: ['google', 'facebook'],
        },
        providerId: String,
        email: String,
        displayName: String,
        photoUrl: String,
        linkedAt: Date,
      },
    ],

    // Profile completion status
    profileCompletionStatus: {
      type: Boolean,
      default: false,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // Account security
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    accountLockedUntil: {
      type: Date,
      default: null,
    },

    // Login metadata
    lastLoginIP: {
      type: String,
      default: null,
    },

    lastLoginUserAgent: {
      type: String,
      default: null,
    },

    // User role
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Compound index for OAuth provider lookup
userSchema.index({ 'oauthProviders.providerId': 1 }, { sparse: true });

// Hash password before saving (for backward compatibility with existing code)
userSchema.pre('save', async function (next) {
  // Don't hash if this is not a password update or passwordHash is already set
  if (!this.isModified('password') || this.passwordHash) {
    return next();
  }

  // Only hash if password field is set and passwordHash is not already set
  if (this.password && !this.passwordHash) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.password, salt);
      // Clear the plain password field after hashing
      this.password = undefined;
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Compare plain password with hash (backward compatibility)
userSchema.methods.comparePassword = function (plain) {
  const hashToCompare = this.passwordHash || this.password;
  if (!hashToCompare) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(plain, hashToCompare);
};

// Check if account is locked
userSchema.methods.isAccountLocked = function () {
  if (!this.accountLockedUntil) {
    return false;
  }
  return this.accountLockedUntil > new Date();
};

// Get minutes remaining until account unlock
userSchema.methods.getMinutesUntilUnlock = function () {
  if (!this.accountLockedUntil) {
    return 0;
  }
  const now = new Date();
  if (this.accountLockedUntil <= now) {
    return 0;
  }
  return Math.ceil((this.accountLockedUntil - now) / (1000 * 60));
};

module.exports = mongoose.model('User', userSchema);
