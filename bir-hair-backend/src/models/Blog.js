const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String },       // Hair Care, Education, Wholesale, Company
  excerpt: { type: String },
  content: { type: String },
  image: { type: String },
  author: { type: String, default: 'B.I.R Hair Team' },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },

  // --- Admin panel fields (additive) ---
  tags: [{ type: String }],
  seoTitle: { type: String },
  seoDescription: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
