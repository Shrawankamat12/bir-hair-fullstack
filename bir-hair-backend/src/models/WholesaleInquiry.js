const mongoose = require('mongoose');

const wholesaleInquirySchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String },
  requirement: { type: String },    
  estimatedMOQ: { type: String },
  
  // the business notification email so the two are never confused.
  enquiryType: { type: String, enum: ['wholesale', 'export'], default: 'wholesale' },
  status: { type: String, enum: ['new', 'contacted', 'quoted', 'converted', 'closed'], default: 'new' },
  notes: { type: String },           // internal admin notes
}, { timestamps: true });

module.exports = mongoose.model('WholesaleInquiry', wholesaleInquirySchema);