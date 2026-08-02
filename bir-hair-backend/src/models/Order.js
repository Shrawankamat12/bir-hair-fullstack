const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ------------------------------------------------------------------ */
/*  Sub-schemas                                                        */
/* ------------------------------------------------------------------ */

const orderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    image: { type: String },

    variant: {
      length: String,
      colour: String,
      texture: String,
      weight: String,
      density: String,
      sku: String,
    },

    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    finalPrice: { type: Number, required: true, min: 0 }, // unitPrice - discount (per unit)
    total: { type: Number, required: true, min: 0 }, // finalPrice * quantity
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const billingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    company: { type: String, trim: true },
    gstNumber: { type: String, trim: true, uppercase: true },
    line1: { type: String, required: true },
    line2: { type: String },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    company: { type: String, trim: true },
    line1: { type: String, required: true },
    line2: { type: String },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

/* ------------------------------------------------------------------ */
/*  Main Order schema                                                  */
/* ------------------------------------------------------------------ */

const orderSchema = new Schema(
  {
    /* ---------------- Customer ---------------- */
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isGuest: { type: Boolean, default: false },
    customerName: { type: String, required: true, trim: true },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9+\-\s()]{7,15}$/, 'Invalid phone number'],
    },

    /* ---------------- Order meta ---------------- */
    orderNumber: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, unique: true, sparse: true, index: true },
    invoiceDate: { type: Date },

    orderSource: {
      type: String,
      enum: ['Website', 'Admin', 'Mobile'],
      default: 'Website',
    },

    orderStatus: {
      type: String,
      enum: [
        'pending',
        'placed',
        'confirmed',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
        'refunded',
      ],
      default: 'pending',
      index: true,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },

    /* ---------------- Products ---------------- */
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },

    /* ---------------- Addresses ---------------- */
    billingAddress: { type: billingAddressSchema, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },

    /* ---------------- Pricing ---------------- */
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      productDiscount: { type: Number, default: 0, min: 0 },
      couponCode: { type: String, trim: true, uppercase: true },
      couponDiscount: { type: Number, default: 0, min: 0 },
      shippingCharge: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      grandTotal: { type: Number, required: true, min: 0 },
    },

    /* ---------------- Payment ---------------- */
    payment: {
      method: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'cod'],
        default: 'card',
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
        default: 'pending',
        index: true,
      },
      transactionId: { type: String },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
    },

    /* ---------------- Shipping ---------------- */
    shipping: {
      method: {
        type: String,
        enum: ['standard', 'express'],
        default: 'standard',
      },
      courierPartner: { type: String },
      trackingNumber: { type: String, index: true },
      awbNumber: { type: String },
      shipmentId: { type: String },
      shippingLabelUrl: { type: String },
      packingSlipUrl: { type: String },
      estimatedDeliveryDate: { type: Date },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },

    /* ---------------- Invoice ---------------- */
    invoice: {
      url: { type: String },
      generated: { type: Boolean, default: false },
      generatedAt: { type: Date },
    },

    /* ---------------- Cancellation ---------------- */
    cancellation: {
      isCancelled: { type: Boolean, default: false },
      cancelledAt: { type: Date },
      cancelledBy: {
        type: String,
        enum: ['customer', 'admin', 'system', null],
        default: null,
      },
      reason: { type: String },
    },

    /* ---------------- Return ---------------- */
    returnInfo: {
      requested: { type: Boolean, default: false },
      approved: { type: Boolean, default: false },
      reason: { type: String },
      returnedAt: { type: Date },
    },

    /* ---------------- Refund ---------------- */
    refund: {
      amount: { type: Number, default: 0, min: 0 },
      status: {
        type: String,
        enum: ['not_applicable', 'pending', 'processed', 'failed'],
        default: 'not_applicable',
      },
      transactionId: { type: String },
      date: { type: Date },
    },

    /* ---------------- Admin ---------------- */
    customerNote: { type: String },
    adminNote: { type: String },
    internalNote: { type: String },

    /* ---------------- Additional flags ---------------- */
    isGiftOrder: { type: Boolean, default: false },
    giftMessage: { type: String },
    isCOD: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Hooks                                                               */
/* ------------------------------------------------------------------ */

// Maintain status history automatically whenever orderStatus changes.
orderSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('orderStatus')) {
    this.statusHistory = this.statusHistory || [];
    const last = this.statusHistory[this.statusHistory.length - 1];
    if (!last || last.status !== this.orderStatus) {
      this.statusHistory.push({ status: this.orderStatus, at: new Date() });
    }
  }

  // Keep derived boolean flags in sync with nested state.
  if (this.isModified('payment.status')) {
    this.isPaid = this.payment.status === 'paid';
  }
  if (this.isModified('orderStatus')) {
    this.isDelivered = this.orderStatus === 'delivered';
  }
  if (this.isModified('payment.method')) {
    this.isCOD = this.payment.method === 'cod';
  }

  next();
});

/* ------------------------------------------------------------------ */
/*  Indexes                                                             */
/* ------------------------------------------------------------------ */

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ invoiceNumber: 1 }, { unique: true, sparse: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shipping.trackingNumber': 1 });

module.exports = mongoose.model('Order', orderSchema);