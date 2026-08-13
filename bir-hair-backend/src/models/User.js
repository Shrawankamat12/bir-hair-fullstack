const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/* ------------------------------------------------------------------ */
/* Address sub-schema                                                 */
/* ------------------------------------------------------------------ */

const addressSchema = new mongoose.Schema(
  {
    label: String,
    company: String,

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    fullName: String,
    phone: String,

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    line1: String,
    line2: String,
    landmark: String,
    city: String,
    state: String,

    country: {
      type: String,
      default: 'India',
    },

    pincode: String,

    latitude: Number,
    longitude: Number,

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

/* ------------------------------------------------------------------ */
/* Cart item sub-schema                                               */
/* ------------------------------------------------------------------ */

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    variant: String,

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ------------------------------------------------------------------ */
/* User schema                                                        */
/* ------------------------------------------------------------------ */

const userSchema = new mongoose.Schema(
  {
    /* ---------------- Basic Information ---------------- */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,

      match: [
        /^\S+@\S+\.\S+$/,
        'Invalid email address',
      ],
    },

    phone: {
      type: String,
      trim: true,

      match: [
        /^[0-9+\-\s()]{7,15}$/,
        'Invalid phone number',
      ],
    },

    /* ---------------- Password ---------------- */

    password: {
      type: String,
      select: false,

      minlength: [
        8,
        'Password must be at least 8 characters long',
      ],

      // Social users don't necessarily have a password
      required: function () {
        return this.authProvider === 'local';
      },
    },

    /* ---------------- Roles ---------------- */

    role: {
      type: String,

      enum: [
        'customer',
        'admin',
        'staff',
      ],

      default: 'customer',
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },

    /* ---------------- Authentication Provider ---------------- */

    authProvider: {
      type: String,

      enum: [
        'local',
        'google',
        'facebook',
        'apple',
      ],

      default: 'local',
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    facebookId: {
      type: String,
      sparse: true,
      unique: true,
    },

    appleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    /* ---------------- Address ---------------- */

    addresses: [addressSchema],

    defaultAddress: {
      type: mongoose.Schema.Types.ObjectId,
    },

    /* ---------------- Account Status ---------------- */

    isActive: {
      type: Boolean,
      default: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedReason: String,

    blockedAt: Date,

    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    /* ---------------- Profile ---------------- */

    avatar: String,

    dateOfBirth: Date,

    gender: {
      type: String,

      enum: [
        'male',
        'female',
        'other',
        'prefer_not_to_say',
      ],
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    /* ---------------- Verification ---------------- */

    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: Date,

    phoneVerifiedAt: Date,

    /* ---------------- Login Information ---------------- */

    lastLogin: Date,

    loginCount: {
      type: Number,
      default: 0,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    /* ---------------- Customer Information ---------------- */

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    rewardPoints: {
      type: Number,
      default: 0,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],

    recentlyViewed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],

    /* ---------------- Cart ---------------- */

    cart: {
      type: [cartItemSchema],
      default: [],
    },

    /* ---------------- Marketing ---------------- */

    acceptsMarketing: {
      type: Boolean,
      default: false,
    },

    acceptsSMS: {
      type: Boolean,
      default: false,
    },

    acceptsEmail: {
      type: Boolean,
      default: true,
    },

    /* ---------------- Security ---------------- */

    passwordChangedAt: Date,

    refreshToken: {
      type: String,
      select: false,
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

/* ------------------------------------------------------------------ */
/* Password Hashing                                                   */
/* ------------------------------------------------------------------ */

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (!this.password) {
    return next();
  }

  this.password = await bcrypt.hash(
    this.password,
    10
  );

  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }

  next();
});

/* ------------------------------------------------------------------ */
/* Password Compare                                                   */
/* ------------------------------------------------------------------ */

userSchema.methods.comparePassword = function (
  candidate
) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(
    candidate,
    this.password
  );
};

/* ------------------------------------------------------------------ */
/* Indexes                                                             */
/* ------------------------------------------------------------------ */

userSchema.index(
  { email: 1 },
  { unique: true }
);

userSchema.index(
  { googleId: 1 },
  { unique: true, sparse: true }
);

userSchema.index(
  { facebookId: 1 },
  { unique: true, sparse: true }
);

userSchema.index(
  { appleId: 1 },
  { unique: true, sparse: true }
);

userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

module.exports = mongoose.model(
  'User',
  userSchema
);