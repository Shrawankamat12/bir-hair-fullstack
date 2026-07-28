const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  delta: { type: Number, required: true },       // positive = added, negative = removed
  reason: { type: String, enum: ['restock', 'correction', 'damaged', 'return', 'order'], default: 'correction' },
  stockAfter: { type: Number },
  adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

inventoryLogSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
