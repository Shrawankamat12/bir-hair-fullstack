const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String },
  description: { type: String },
  sortOrder: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
}, { timestamps: true });

subCategorySchema.index({ categoryId: 1 });

module.exports = mongoose.model('SubCategory', subCategorySchema);
