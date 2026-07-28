const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  subscribedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['subscribed', 'unsubscribed'], default: 'subscribed' },
  source: { type: String, default: 'Website' },
}, { timestamps: true });

module.exports = mongoose.model('Newsletter', newsletterSchema);
