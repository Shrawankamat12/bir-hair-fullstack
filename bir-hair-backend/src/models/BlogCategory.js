const mongoose = require('mongoose');

const blogCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  status: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('BlogCategory', blogCategorySchema);
