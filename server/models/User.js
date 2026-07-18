const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Authentication
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone:    { type: String, sparse: true, unique: true },
    
    // Profile
    name:     String,
    profilePhoto: String,
    gender:   { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    dob:      Date,
    
    // Profile completion
    profileCompleted: { type: Boolean, default: false },
    
    // Session management
    lastLogin: Date,
    refreshToken: { type: String, select: false }, // Hashed refresh token
    
    // OAuth
    provider: { type: String, enum: ['email', 'google', 'facebook', 'phone'], default: 'email' },
    providerId: String,
    
    // Account
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    preferences: {
      notifications: { type: Boolean, default: true },
      emailUpdates: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
    },
    
    // Account status
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

    // Saved addresses
    addresses: [{
      name:     { type: String, required: true },
      phone:    String,
      line1:    { type: String, required: true },
      line2:    String,
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      pincode:  { type: String, required: true },
      country:  { type: String, default: 'India' },
      isDefault: { type: Boolean, default: false },
    }],
  },
  { timestamps: true }
);

// Indexes for faster queries (remove duplicates if fields have unique: true)
userSchema.index({ provider: 1 });
userSchema.index({ createdAt: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare plain password with hash
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
