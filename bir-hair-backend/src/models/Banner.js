const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  image: { type: String, required: true },
  ctaText: { type: String },
  ctaLink: { type: String },
  placement: { type: String, enum: ['home-hero', 'home-strip', 'shop-top', 'deal-of-day', 'category-top', 'popup'], default: 'home-hero' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },

  // --- Admin panel field aliases (additive; normalized onto the fields above in banner.service.js) ---
  startDate: { type: Date },
  endDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
