const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/* ------------------------------------------------------------------ */
/*  Address sub-schema (improved — additive, existing fields kept)     */
/* ------------------------------------------------------------------ */

const addressSchema = new mongoose.Schema({
  label: String,
  company: { type: String },
  gstNumber: { type: String, trim: true, uppercase: true },
  fullName: String,
  phone: String,
  email: { type: String, trim: true, lowercase: true },
  line1: String,
  line2: { type: String },
  landmark: { type: String },
  city: String,
  state: String,
  country: { type: String, default: 'India' },
  pincode: String,
  latitude: { type: Number },
  longitude: { type: Number },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

/* ------------------------------------------------------------------ */
/*  Cart item sub-schema                                               */
/* ------------------------------------------------------------------ */

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: String }, // variant SKU / identifier within Product.variants
  quantity: { type: Number, default: 1, min: 1 },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

/* ------------------------------------------------------------------ */
/*  User schema                                                        */
/* ------------------------------------------------------------------ */

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]{7,15}$/, 'Invalid phone number'],
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  role: { type: String, enum: ['customer', 'admin', 'staff'], default: 'customer' },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }, // optional link to a custom Role (Roles & Permissions module)
  addresses: [addressSchema],
  isActive: { type: Boolean, default: true },

  /* ---------------- Profile ---------------- */
  avatar: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
  profileCompleted: { type: Boolean, default: false },

  /* ---------------- Account ---------------- */
  isVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date },
  phoneVerifiedAt: { type: Date },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },

  /* ---------------- Customer ---------------- */
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  rewardPoints: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  defaultAddress: { type: mongoose.Schema.Types.ObjectId },

  /* ---------------- Cart ---------------- */
  cart: { type: [cartItemSchema], default: [] },

  /* ---------------- Account status ---------------- */
  isBlocked: { type: Boolean, default: false },
  blockedReason: { type: String },
  blockedAt: { type: Date },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  /* ---------------- Marketing ---------------- */
  acceptsMarketing: { type: Boolean, default: false },
  acceptsSMS: { type: Boolean, default: false },
  acceptsEmail: { type: Boolean, default: true },

  /* ---------------- Security ---------------- */
  failedLoginAttempts: { type: Number, default: 0 },
  passwordChangedAt: { type: Date },
  refreshToken: { type: String, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

/* ------------------------------------------------------------------ */
/*  Hooks                                                               */
/* ------------------------------------------------------------------ */

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

/* ------------------------------------------------------------------ */
/*  Methods                                                             */
/* ------------------------------------------------------------------ */

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/* ------------------------------------------------------------------ */
/*  Indexes                                                             */
/* ------------------------------------------------------------------ */

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

module.exports = mongoose.model('User', userSchema);