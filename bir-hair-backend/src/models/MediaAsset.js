const mongoose = require('mongoose');

const mediaAssetSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String },
  folder: { type: String, default: 'general' },
  originalName: { type: String },
  size: { type: Number },
  mimeType: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

mediaAssetSchema.index({ folder: 1, createdAt: -1 });

module.exports = mongoose.model('MediaAsset', mediaAssetSchema);
