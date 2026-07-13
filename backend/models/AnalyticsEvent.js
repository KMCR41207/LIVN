const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    event: { type: String, required: true, trim: true },
    page:  { type: String, default: '' },
    meta:  { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// Compound index for efficient per-event counting and time-range queries
analyticsEventSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
