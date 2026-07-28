const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  website: { type: String },
  description: { type: String },
  logo: { type: String },
  banner: { type: String },
  seoTitle: { type: String },
  seoDescription: { type: String },
  featured: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
