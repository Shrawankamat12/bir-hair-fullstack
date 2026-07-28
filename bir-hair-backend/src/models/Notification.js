const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String },
  type: { type: String, enum: ['order', 'stock', 'review', 'system', 'wholesale', 'contact'], default: 'system' },
  link: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
