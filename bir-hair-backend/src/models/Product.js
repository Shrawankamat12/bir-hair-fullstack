const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  sku: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  texture: { type: String },        // Straight, Body Wave, Deep Curly...
  hairType: { type: String },       // Virgin, Remy, Raw
  length: { type: Number },         // inches
  color: { type: String },          // Natural Black, #613 Blonde, Ombre
  weight: { type: String, default: '100g' },
  description: { type: String },
  images: [{ type: String }],       // multiple product images

  mrp: { type: Number, required: true },
  price: { type: Number, required: true },
  discountPct: { type: Number, default: 0 },

  stock: { type: Number, default: 0 },
  badge: { type: String, enum: ['Bestseller', 'New', 'Trending', "Editor's Pick", null], default: null },
  tone: { type: String },

  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
  isWholesaleAvailable: { type: Boolean, default: true },

  // --- Admin panel fields (additive, storefront fields above untouched) ---
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
  collectionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },

  discountPrice: { type: Number },
  costPrice: { type: Number },
  minStock: { type: Number, default: 5 },

  hairType: { type: String },
  hairTexture: { type: String },
  hairLength: { type: String },
  hairColour: { type: String },
  hairDensity: { type: String },
  hairOrigin: { type: String },

  gallery: [{ url: String, isPrimary: { type: Boolean, default: false } }],
  video: { type: String },

  specifications: { type: String },
  careInstructions: { type: String },
  shippingInfo: { type: String },
  returnPolicy: { type: String },

  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: { type: String },

  featured: { type: Boolean, default: false },

  hasVariants: { type: Boolean, default: false },
  variants: [{
    length: String, colour: String, texture: String, weight: String, density: String,
    sku: String, price: Number, stock: { type: Number, default: 0 },
  }],

  // --- Home-page shelves + per-product visibility control (additive) ---
  newArrival: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  premium: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },
  flashSale: { type: Boolean, default: false },
  flashSaleEndsAt: { type: Date },
  recommended: { type: Boolean, default: false },
  saleBadgeText: { type: String },
  tags: [{ type: String }],
  visibility: { type: String, enum: ['visible', 'hidden'], default: 'visible' },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });
// Common storefront query shapes: shop listing filtered by category/active,
// badge shelves (Bestseller/New/etc.), and low-stock lookups for the admin dashboard.
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ badge: 1, isActive: 1 });
productSchema.index({ isActive: 1, stock: 1 });
productSchema.index({ createdAt: -1 });
// Home-page shelf queries: isActive + visibility + a specific flag (see product.service#getByFlag).
productSchema.index({ isActive: 1, visibility: 1, newArrival: 1 });
productSchema.index({ isActive: 1, visibility: 1, trending: 1 });
productSchema.index({ isActive: 1, visibility: 1, premium: 1 });
productSchema.index({ isActive: 1, visibility: 1, bestSeller: 1 });
productSchema.index({ isActive: 1, visibility: 1, flashSale: 1 });
productSchema.index({ isActive: 1, visibility: 1, recommended: 1 });
productSchema.index({ tags: 1 });

module.exports = mongoose.model('Product', productSchema);
