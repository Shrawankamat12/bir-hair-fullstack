const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
  value: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  expiresAt: { type: Date },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },

  // --- Admin panel fields (additive) ---
  description: { type: String },
  perUserLimit: { type: Number },
  startDate: { type: Date },
  usageHistory: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: String,
    usedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
