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
  freeShippingThreshold: { type: Number, default: 15000 },
  flatShippingRate: { type: Number, default: 15 },
  expressShippingRate: { type: Number, default: 999 },
  shippingZones: String,
  // Payment
  paymentGateway: { type: String, default: 'Bluevine Payment Link' },
  bluevinePaymentLink: String,
  codEnabled: { type: Boolean, default: true },
  // Tax
  taxRate: { type: Number, default: 0 }, taxLabel: { type: String, default: 'GST' },
  // Email
  smtpHost: String, smtpPort: String, smtpUser: String, smtpFrom: String,
  // SMS
  smsProvider: String, smsApiKey: String,
  // Social
  facebook: String, instagram: String, twitter: String, youtube: String, whatsapp: String,
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);