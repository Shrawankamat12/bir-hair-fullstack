const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String },        // "USA · Salon Owner"
  quote: { type: String, required: true },
  rating: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },

  // --- Admin panel field alias (additive; normalized in testimonial.service.js) ---
  photo: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
