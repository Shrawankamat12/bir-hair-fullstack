const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['hairType', 'hairTexture', 'hairLength', 'hairColour', 'hairDensity', 'hairWeight', 'hairOrigin'],
  },
  name: { type: String, required: true, trim: true },
  value: { type: String },
  colorSwatch: { type: String },
  sortOrder: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
  productCount: { type: Number, default: 0 },
}, { timestamps: true });

attributeSchema.index({ type: 1, sortOrder: 1 });

module.exports = mongoose.model('Attribute', attributeSchema);
