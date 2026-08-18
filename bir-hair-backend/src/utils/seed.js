// Run `npm run seed` to insert an admin user, sample categories, products,
// testimonials, FAQs and a blog post — enough for the storefront to render
// real data end-to-end. Re-run any time; it's idempotent (clears + reinserts
// catalog content, but never touches existing orders/users beyond the admin).
require("dotenv").config();
const mongoose = require("mongoose");
const slugify = require("slugify");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Testimonial = require("../models/Testimonial");
const Faq = require("../models/Faq");
const Blog = require("../models/Blog");

const categories = [
  {
    name: "Hair Extensions",
    slug: "extensions",
    tag: "Tape-in · I-Tip · U-Tip · V-Tip",
    tone: "gold",
  },
  {
    name: "Raw Hair Bundles",
    slug: "raw-bundles",
    tag: "Body Wave · Deep Curly · Kinky Curly",
    tone: "brown",
  },
  {
    name: "Closures & Frontals",
    slug: "closures",
    tag: "HD 13x4 · 13x6",
    tone: "beige",
  },
  {
    name: "Wigs & Toppers",
    slug: "wigs",
    tag: "Full Lace · Bob · Curly · Long Wavy",
    tone: "espresso",
  },
  {
    name: "Blonde Hair",
    slug: "blonde",
    tag: "Lightened & Toned",
    tone: "cream",
  },
  {
    name: "Bulk Hair",
    slug: "bulk",
    tag: "Braiding · Micro-Ring",
    tone: "gold",
  },
];

function product(name, categorySlug, overrides = {}) {
  return {
    name,
    slug: slugify(name, { lower: true, strict: true }),
    sku:
      "BIR-" +
      slugify(name, { strict: true }).toUpperCase().slice(0, 10) +
      "-" +
      Math.floor(Math.random() * 900 + 100),
    texture: "Straight",
    hairType: "Remy",
    length: 18,
    color: "Natural Black",
    weight: "100g",
    mrp: 12000,
    price: 9500,
    discountPct: 21,
    stock: 40,
    tone: "gold",
    images: [],
    isActive: true,
    __categorySlug: categorySlug,
    ...overrides,
  };
}

const sampleProducts = [
  product('Silky Straight Bundle 18"', "raw-bundles", {
    badge: "Bestseller",
    texture: "Straight",
  }),
  product('Body Wave Double Drawn 20"', "raw-bundles", {
    badge: "Bestseller",
    texture: "Body Wave",
    tone: "brown",
  }),
  product("HD 13x4 Lace Frontal", "closures", {
    badge: "Trending",
    texture: "Straight",
    tone: "beige",
    price: 6500,
    mrp: 8200,
  }),
  product('Full Lace Bob Wig 12"', "wigs", {
    badge: "New",
    length: 12,
    tone: "espresso",
    price: 15500,
    mrp: 19000,
  }),
  product('Deep Curly Frontal Wig 22"', "wigs", {
    badge: "Trending",
    texture: "Deep Curly",
    length: 22,
    tone: "espresso",
  }),
  product('Tape-in Extensions Set 20"', "extensions", {
    badge: "Bestseller",
    length: 20,
    tone: "gold",
  }),
  product('#613 Blonde Bundle 22"', "blonde", {
    badge: "New",
    length: 22,
    color: "#613 Blonde",
    tone: "cream",
    price: 13500,
    mrp: 17000,
  }),
  product('Kinky Curly Raw Bundle 16"', "raw-bundles", {
    texture: "Kinky Curly",
    length: 16,
    hairType: "Raw",
    tone: "brown",
  }),
  product("4x4 HD Lace Closure", "closures", {
    texture: "Straight",
    tone: "beige",
    price: 4800,
    mrp: 6000,
  }),
  product("Braiding Bulk Hair 100g", "bulk", {
    hairType: "Virgin",
    tone: "gold",
    price: 3200,
    mrp: 4000,
  }),
];

const testimonials = [
  {
    name: "Amara Okafor",
    country: "Nigeria",
    quote:
      "Held its wave through three washes with zero shedding — exactly as described.",
    rating: 5,
    isActive: true,
    order: 1,
  },
  {
    name: "Priya Nair",
    country: "UAE",
    quote:
      "Our salon reorders every month. Consistent quality, fast dispatch from Delhi.",
    rating: 5,
    isActive: true,
    order: 2,
  },
  {
    name: "Latoya Brown",
    country: "USA",
    quote: "Best factory-direct pricing I have found for genuine Remy hair.",
    rating: 4.5,
    isActive: true,
    order: 3,
  },
];

const faqs = [
  {
    category: "Shipping",
    question: "How fast do you ship?",
    answer:
      "Orders ship from our Delhi warehouse within 24 hours. Domestic delivery takes 3–6 business days, international 6–12 business days.",
    isActive: true,
    order: 1,
  },
  {
    category: "Returns",
    question: "What is your return policy?",
    answer:
      "Unused, unopened bundles can be returned within 7 days of delivery for a full refund.",
    isActive: true,
    order: 1,
  },
  {
    category: "Hair Care",
    question: "How do I care for Remy hair extensions?",
    answer:
      "Wash with sulfate-free shampoo, condition mid-length to ends, and air-dry when possible to preserve the cuticle alignment.",
    isActive: true,
    order: 1,
  },
  {
    category: "Bulk / Export",
    question: "Do you offer wholesale pricing?",
    answer:
      "Yes — visit our Wholesale page to submit an enquiry and get factory-direct bulk pricing.",
    isActive: true,
    order: 1,
  },
];

const blogs = [
  {
    title: "How We Sort Every Bundle by Hand",
    slug: "how-we-sort-every-bundle-by-hand",
    category: "Company",
    excerpt:
      "A look inside our Kirti Nagar sorting floor, where every bundle is checked for texture and root direction.",
    content:
      "Every bundle that enters our factory is hand-sorted by a dedicated team before it ever reaches production.\n\nThis single step is why our hair stays tangle-resistant wear after wear — cuticles stay aligned root to tip.",
    isPublished: true,
    publishedAt: new Date(),
  },
];

async function run() {
  await connectDB();

  const insertedCategories = await Category.deleteMany().then(() =>
    Category.insertMany(categories),
  );
  const catBySlug = Object.fromEntries(
    insertedCategories.map((c) => [c.slug, c._id]),
  );

  await Product.deleteMany();
  await Product.insertMany(
    sampleProducts.map(({ __categorySlug, ...p }) => ({
      ...p,
      category: catBySlug[__categorySlug],
    })),
  );

  await Testimonial.deleteMany();
  await Testimonial.insertMany(testimonials);

  await Faq.deleteMany();
  await Faq.insertMany(faqs);

  await Blog.deleteMany();
  await Blog.insertMany(blogs);

  const adminExists = await User.findOne({ email: "admin@birhair.com" });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@birhair.com",
      password: "Admin@123",
      role: "admin",
    });
    console.log("Admin user created: admin@birhair.com / Admin@123");
  }

  console.log(
    `Seed complete — ${insertedCategories.length} categories, ${sampleProducts.length} products, ${testimonials.length} testimonials, ${faqs.length} FAQs, ${blogs.length} blog post(s).`,
  );
  mongoose.connection.close();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  mongoose.connection.close();
});
//say hai