const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
  homeSectionOrder: {
    type: [String],
    default: [
      'hero', 'categories', 'featuredCategories', 'newArrivals', 'trending',
      'premium', 'bestSellers', 'featured', 'flashSale', 'collections',
      'whyChooseUs', 'process', 'factoryGallery', 'certifications',
      'exportCountries', 'beforeAfter', 'offers', 'instagram',
      'videoReviews', 'couponBanner', 'testimonials', 'faqTeaser',
    ],
  },
  hero: {
    slides: [{
      image: String, mobileImage: String, title: String, subtitle: String,
      ctaText: String, ctaLink: String, sortOrder: { type: Number, default: 0 },
    }],
  },
  whyChooseUs: {
    heading: String, subheading: String,
    items: [{ icon: String, title: String, description: String }],
  },
  process: {
    heading: String, subheading: String,
    steps: [{ icon: String, title: String, description: String, sortOrder: { type: Number, default: 0 } }],
  },
  factoryGallery: {
    heading: String, subheading: String,
    images: [{ url: String, caption: String }],
  },
  certifications: {
    heading: String,
    items: [{ logo: String, name: String, link: String }],
  },
  exportCountries: {
    heading: String, subheading: String,
    countries: [{ name: String, flag: String }],
  },
  beforeAfter: {
    heading: String, subheading: String,
    items: [{ beforeImage: String, afterImage: String, caption: String }],
  },
  instagram: {
    heading: String, handle: String,
    posts: [{ image: String, link: String }],
  },
  videoReviews: {
    heading: String,
    videos: [{ thumbnail: String, videoUrl: String, customerName: String, caption: String }],
  },
  couponBanner: {
    enabled: { type: Boolean, default: false },
    text: String, code: String, link: String,
  },
  faqTeaser: {
    heading: String, subheading: String,
    faqIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faq' }],
  },
  footer: {
    aboutText: String, logo: String,
    columns: [{
      title: String,
      links: [{ label: String, url: String }],
      sortOrder: { type: Number, default: 0 },
    }],
    socials: {
      facebook: String, instagram: String, twitter: String, youtube: String, whatsapp: String, pinterest: String,
    },
    paymentIcons: [{ type: String }],
    bottomText: String,
  },
  header: {
    announcementBar: {
      enabled: { type: Boolean, default: false },
      text: String, link: String,
    },
    navLinks: [{ label: String, url: String, sortOrder: { type: Number, default: 0 } }],
    topBarPhone: String, topBarEmail: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('SiteContent', siteContentSchema);
