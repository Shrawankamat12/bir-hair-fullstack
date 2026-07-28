const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  isApproved: { type: Boolean, default: false },

  // --- Admin panel fields (additive) ---
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  images: [{ type: String }],
  reply: { type: String },
}, { timestamps: true });

// Product page fetches approved reviews for one product, newest first.
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
