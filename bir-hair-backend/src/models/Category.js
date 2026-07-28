const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  tag: { type: String },       // e.g. "Tape-in · I-Tip · U-Tip"
  tone: { type: String },      // gold, brown, beige, espresso, cream
  image: { type: String },     // URL / uploaded path
  showInMegaMenu: { type: Boolean, default: true },
  order: { type: Number, default: 0 },

  // --- Admin panel fields (additive, storefront fields above untouched) ---
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  banner: { type: String },
  icon: { type: String },
  description: { type: String },
  sortOrder: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: { type: String },
}, { timestamps: true });

categorySchema.index({ parentId: 1 });

module.exports = mongoose.model('Category', categorySchema);
