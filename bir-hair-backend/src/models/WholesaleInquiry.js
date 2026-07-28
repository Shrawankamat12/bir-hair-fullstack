const mongoose = require('mongoose');

const wholesaleInquirySchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String },
  requirement: { type: String },     // free-text: products / quantity needed
  estimatedMOQ: { type: String },
  status: { type: String, enum: ['new', 'contacted', 'quoted', 'converted', 'closed'], default: 'new' },
  notes: { type: String },           // internal admin notes
}, { timestamps: true });

module.exports = mongoose.model('WholesaleInquiry', wholesaleInquirySchema);
