const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  sku: String,
  image: String,
  price: Number,
  qty: { type: Number, default: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for guest checkout
  isGuest: { type: Boolean, default: false },
  orderNumber: { type: String, required: true, unique: true },

  items: [orderItemSchema],

  shippingAddress: {
    fullName: String,
    phone: String,
    email: String,
    line1: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
  },

  shippingMethod: { type: String, enum: ['standard', 'express'], default: 'standard' },
  shippingCost: { type: Number, default: 0 },

  paymentMethod: { type: String, enum: ['card', 'upi', 'cod'], default: 'card' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },

  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },

  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'placed',
  },
  trackingId: { type: String },

  // Razorpay — populated once a payment session is created / verified.
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },

  // Shiprocket — populated once a shipment is created for this order.
  shiprocketShipmentId: { type: String },
  shiprocketAwbCode: { type: String },
  courierName: { type: String },

  // Real audit trail for the admin panel's Order Timeline (each status change appended).
  statusHistory: [{
    status: String,
    at: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('status')) {
    this.statusHistory = this.statusHistory || [];
    const last = this.statusHistory[this.statusHistory.length - 1];
    if (!last || last.status !== this.status) {
      this.statusHistory.push({ status: this.status, at: new Date() });
    }
  }
  next();
});

// Admin order list filters by status + sorts by newest; "my orders" filters by user.
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
