const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  image: { type: String },
  banner: { type: String },
  description: { type: String },
  seoTitle: { type: String },
  seoDescription: { type: String },
  status: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Collection', collectionSchema);
