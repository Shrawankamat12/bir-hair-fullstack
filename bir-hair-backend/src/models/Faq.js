const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  category: { type: String, required: true }, // Shipping, Returns, Hair Care, Bulk / Export
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Faq', faqSchema);
