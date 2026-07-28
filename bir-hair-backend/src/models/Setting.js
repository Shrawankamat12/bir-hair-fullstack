const mongoose = require('mongoose');

// Singleton document — one Settings row for the whole store. Flat field
// names deliberately mirror the admin panel's Settings.jsx form exactly,
// so no field-mapping layer is needed between frontend and backend.
const settingSchema = new mongoose.Schema({
  // General
  storeName: String, storeEmail: String, storePhone: String, storeAddress: String,
  logo: String, favicon: String,
  // SEO
  seoTitle: String, seoDescription: String, seoKeywords: String,
  // Shipping
  freeShippingThreshold: Number, flatShippingRate: Number, shippingZones: String,
  // Payment
  paymentGateway: String, razorpayKey: String, codEnabled: { type: Boolean, default: true },
  // Tax
  taxRate: Number, taxLabel: { type: String, default: 'GST' },
  // Email
  smtpHost: String, smtpPort: String, smtpUser: String, smtpFrom: String,
  // SMS
  smsProvider: String, smsApiKey: String,
  // Social
  facebook: String, instagram: String, twitter: String, youtube: String, whatsapp: String,
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
