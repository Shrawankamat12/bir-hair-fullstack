const mongoose = require('mongoose');

// Singleton document (one row) — mirrors the Setting.js pattern already used
// for store settings. This model exists so every previously hardcoded block
// on the storefront Home page, Footer and Header can be edited from the
// admin panel without a redeploy.

const linkSchema = new mongoose.Schema({ label: String, url: String }, { _id: false });

const siteContentSchema = new mongoose.Schema({
  // ---------------- HOME PAGE ----------------
  hero: {
    eyebrow: { type: String, default: 'Manufacturer · Exporter · Supplier — Est. 2014' },
    title: { type: String, default: 'Pure Indian Remy Hair.' },
    highlightText: { type: String, default: 'Crafted for Royalty.' },
    subtitle: { type: String, default: 'Factory-direct 100% human hair, ethically sourced from India — trusted by exporters in 50+ countries since 2014.' },
    image: { type: String },
    primaryCtaText: { type: String, default: 'Shop Now' },
    primaryCtaLink: { type: String, default: '/shop' },
    secondaryCtaText: { type: String, default: 'Explore Collection' },
    secondaryCtaLink: { type: String, default: '/about' },
    badges: { type: [String], default: ['100% Human Hair', 'Factory Direct', 'Worldwide Shipping', 'Manufacturer & Exporter'] },
    stats: {
      type: [{ value: String, label: String, _id: false }],
      default: [{ value: '2014', label: 'Established' }, { value: '200+', label: 'Artisans' }, { value: '50+', label: 'Export Countries' }],
    },
    ratingValue: { type: Number, default: 4.9 },
    ratingLabel: { type: String, default: '4.9 from 3,200+ buyers' },
  },

  whyChooseUs: {
    eyebrow: { type: String, default: 'Why B.I.R Hair India Factory' },
    title: { type: String, default: 'Factory-direct, without the compromises' },
    items: {
      type: [{ title: String, description: String, _id: false }],
      default: [
        { title: 'No Middlemen', description: 'Every bundle ships straight from our Delhi factory floor to your door, at factory pricing.' },
        { title: '200+ Skilled Artisans', description: 'Hand-sorting and wefting done by a dedicated in-house team, not outsourced labour.' },
        { title: 'Cuticle-Aligned Hair', description: 'Root-to-tip alignment on every bundle, preserving natural shine and reducing tangling.' },
        { title: 'Export Since 2014', description: 'A decade of documented, compliant exports to distributors across 50+ countries.' },
      ],
    },
  },

  processSteps: {
    type: [{ step: String, desc: String, _id: false }],
    default: [
      { step: 'Sourcing', desc: 'Hair is collected from temple donations and trusted regional collectors across India, cuticle intact and root-aligned.' },
      { step: 'Sorting', desc: 'Every bundle is hand-sorted by our artisans for texture, length and root direction before it enters production.' },
      { step: 'Double Drawn', desc: 'Shorter strands are removed by hand so each bundle keeps a uniform thickness from root to tip.' },
      { step: 'Wefting', desc: 'Bundles are machine or hand-wefted at our Kirti Nagar facility with reinforced double stitching.' },
      { step: 'Quality Control', desc: 'A dedicated QC team checks shedding, tangle resistance and colour match against factory samples.' },
      { step: 'Packing', desc: 'Each order is packed with batch documentation and shipped from Delhi within 24 hours.' },
    ],
  },

  factoryGallery: {
    eyebrow: { type: String, default: 'Kirti Nagar, Delhi' },
    title: { type: String, default: 'Inside Our Factory' },
    images: { type: [{ label: String, image: String, _id: false }], default: [] },
  },

  certifications: {
    type: [String],
    default: ['ISO 9001:2015 Certified Facility', '100% Cuticle-Aligned Human Hair', 'Ethically Sourced & Traceable', 'Export Compliance Verified'],
  },

  exportCountries: {
    type: [String],
    default: ['USA', 'UK', 'Nigeria', 'UAE', 'South Africa', 'Brazil', 'France', 'Kenya', 'Canada', 'Ghana', 'Jamaica', 'Germany'],
  },

  beforeAfter: {
    type: [{ title: String, tag: String, beforeImage: String, afterImage: String, _id: false }],
    default: [],
  },

  instagram: {
    handle: { type: String, default: '@birhairindiafactory' },
    images: { type: [String], default: [] },
  },

  videoReviews: { type: [String], default: [] },

  couponBanner: {
    enabled: { type: Boolean, default: true },
    eyebrow: { type: String, default: 'Luxury Coupon' },
    code: { type: String, default: 'BIRGOLD10' },
    title: { type: String, default: 'off your first bulk order' },
    discountText: { type: String, default: '10%' },
    ctaText: { type: String, default: 'Shop & Save' },
    ctaLink: { type: String, default: '/shop' },
  },

  faqTeaser: {
    eyebrow: { type: String, default: 'Have Questions?' },
    title: { type: String, default: "We've Got Answers" },
    description: { type: String, default: 'Shipping timelines, hair care, returns and bulk export terms — all in one place.' },
    ctaText: { type: String, default: 'Visit FAQ' },
  },

  newsletterSection: {
    eyebrow: { type: String, default: 'Stay In The Loop' },
    title: { type: String, default: 'Join the B.I.R Hair Circle' },
    description: { type: String, default: 'New drops, factory stories and export-only offers — straight to your inbox.' },
  },

  // Which flag-driven shelves show on Home, and in what order (admin toggle + reorder)
  homeSections: {
    type: [{ key: String, enabled: { type: Boolean, default: true }, order: { type: Number, default: 0 }, _id: false }],
    default: [
      { key: 'categories', enabled: true, order: 0 },
      { key: 'featuredCategories', enabled: true, order: 1 },
      { key: 'bestSellers', enabled: true, order: 2 },
      { key: 'flashSale', enabled: true, order: 3 },
      { key: 'newArrivals', enabled: true, order: 4 },
      { key: 'trending', enabled: true, order: 5 },
      { key: 'premium', enabled: true, order: 6 },
      { key: 'featuredProducts', enabled: true, order: 7 },
      { key: 'collections', enabled: true, order: 8 },
      { key: 'testimonials', enabled: true, order: 9 },
    ],
  },

  // ---------------- FOOTER ----------------
  footer: {
    brandDescription: { type: String, default: 'Blessing Indian Remy Hair Exports Pvt. Ltd. — 100% human hair extensions, wigs, closures and raw bundles, manufactured and exported from Kirti Nagar, Delhi since 2014.' },
    address: { type: String, default: 'Kirti Nagar Industrial Area, New Delhi, 110015, India' },
    phone: { type: String, default: '+91 98-XXXX-XXXX' },
    email: { type: String, default: 'export@birhairindia.com' },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    columns: {
      type: [{ title: String, links: [linkSchema], _id: false }],
      default: [
        { title: 'Shop', links: [{ label: 'Hair Extensions', url: '/shop' }, { label: 'Raw Hair Bundles', url: '/shop' }, { label: 'Closures & Frontals', url: '/shop' }, { label: 'Wigs & Toppers', url: '/shop' }, { label: 'Bulk Hair', url: '/shop' }] },
        { title: 'Company', links: [{ label: 'About Us', url: '/about' }, { label: 'Factory & Manufacturing', url: '/factory' }, { label: 'Export / Wholesale', url: '/wholesale' }, { label: 'Journal', url: '/journal' }, { label: 'Contact', url: '/contact' }] },
        { title: 'Support', links: [{ label: 'FAQ', url: '/faq' }, { label: 'Shipping & Returns', url: '/policy/shipping' }, { label: 'Privacy Policy', url: '/policy/privacy' }, { label: 'Terms of Service', url: '/policy/terms' }, { label: 'My Account', url: '/account' }] },
      ],
    },
    trustBadges: { type: [String], default: ['100% Human Hair', 'Factory Direct', 'Worldwide Shipping', 'Secure Payments'] },
    bottomText: { type: String, default: 'Made in Delhi, shipped worldwide.' },
  },

  // ---------------- HEADER ----------------
  header: {
    announcementEnabled: { type: Boolean, default: false },
    announcementText: { type: String, default: '' },
    announcementLink: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('SiteContent', siteContentSchema);
