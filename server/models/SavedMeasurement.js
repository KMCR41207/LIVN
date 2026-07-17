const mongoose = require('mongoose');

const measurementProfileSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  name: {
    type: String,
    required: true,
    enum: ['Personal', 'Mother', 'Sister', 'Daughter', 'Friend', 'Other'],
  },
  bust: {
    type: Number,
    required: true,
  },
  waist: {
    type: Number,
    required: true,
  },
  hips: {
    type: Number,
    required: true,
  },
  length: Number,
  shoulder: Number,
  sleeve: Number,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const savedMeasurementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    measurements: [measurementProfileSchema],
    defaultMeasurementId: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
  }
);

// Validate measurements array doesn't exceed 10
savedMeasurementSchema.pre('save', function (next) {
  if (this.measurements.length > 10) {
    return next(new Error('Maximum 10 measurement profiles allowed'));
  }
  next();
});

// Index for faster queries
savedMeasurementSchema.index({ userId: 1 });

module.exports = mongoose.model('SavedMeasurement', savedMeasurementSchema);
