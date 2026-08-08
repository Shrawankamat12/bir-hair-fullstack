// The storefront UI (ProductCard, Cart, ProductDetail, etc.) was originally built
// against src/data/products.js's plain object shapes. Rather than rewrite every
// component's JSX, we normalize API responses into those same shapes here —
// one place to update if the contract ever changes.

// Variants come back from the API with their own (sometimes differently-named)
// fields — e.g. "colour" instead of "color", pricing under unitPrice/sellingPrice
// instead of price/mrp. We normalize each variant to the same shape the rest of
// the app expects, with fallbacks for the field-name variants we've seen in
// real API responses.
export function normalizeVariant(v) {
  if (!v) return v;
  return {
    id: v._id || v.id || v.sku,
    sku: v.sku,
    length: v.length,
    color: v.color || v.colour, // API sometimes sends British spelling "colour"
    texture: v.texture,
    hairType: v.hairType || v.texture, // fall back to texture if hairType isn't sent
    weight: v.weight,
    density: v.density,
    price: v.price ?? v.unitPrice ?? v.sellingPrice ?? v.finalPrice,
    mrp: v.mrp ?? v.unitPrice,
    discount: v.discount ?? 0,
    stock: v.stock,
    image: v.image || v.images?.[0] || v.gallery?.[0]?.url || v.gallery?.[0],
    images: v.images || (v.gallery || []).map((g) => (typeof g === 'string' ? g : g.url)).filter(Boolean),
  };
}

export function normalizeProduct(p) {
  if (!p) return p;
  return {
    id: p._id,
    slug: p.slug,
    name: p.name,
    category: p.category?.slug || p.category,
    categoryName: p.category?.name,
    subcategory: p.subcategory,
    collectionRef: p.collectionRef,
    brand: p.brand,
    texture: p.texture,
    hairType: p.hairType || p.texture, // fall back to texture if hairType isn't sent
    length: p.length,
    color: p.color || p.colour, // API sometimes sends British spelling "colour"
    rating: p.rating || 0,
    reviews: p.reviewsCount || 0,
    mrp: p.mrp,
    price: p.price,
    discountPct: p.discountPct || 0,
    badge: p.badge,
    tone: p.tone,
    weight: p.weight,
    sku: p.sku,
    stock: p.stock,
    description: p.description,
    specifications: p.specifications,
    careInstructions: p.careInstructions,
    shippingInfo: p.shippingInfo,
    returnPolicy: p.returnPolicy,
    image: p.images?.[0] || p.gallery?.[0]?.url,
    images: p.images?.length ? p.images : (p.gallery || []).map((g) => (typeof g === 'string' ? g : g.url)).filter(Boolean),
    gallery: p.gallery || [],
    video: p.video || '',
    hasVariants: !!p.hasVariants,
    variants: (p.variants || []).map(normalizeVariant),
    // --- Admin-controlled homepage / merchandising flags ---
    featured: !!p.featured,
    newArrival: !!p.newArrival,
    trending: !!p.trending,
    premium: !!p.premium,
    bestSeller: !!p.bestSeller,
    flashSale: !!p.flashSale,
    flashSaleEndsAt: p.flashSaleEndsAt,
    recommended: !!p.recommended,
    saleBadgeText: p.saleBadgeText || '',
    tags: p.tags || [],
    visibility: p.visibility || 'visible',
  };
}

export function normalizeCategory(c) {
  if (!c) return c;
  return {
    id: c.slug,
    _id: c._id,
    slug: c.slug,
    name: c.name,
    tone: c.tone,
    tag: c.tag,
    image: c.image,
    img: c.image, // kept for any older code still reading `img`
    featured: !!c.featured,
  };
}

export function normalizeSubCategory(s) {
  if (!s) return s;
  return { id: s._id, _id: s._id, name: s.name, slug: s.slug, categoryId: s.categoryId?._id || s.categoryId, image: s.image };
}

export function normalizeBrand(b) {
  if (!b) return b;
  return { id: b._id, _id: b._id, name: b.name, logo: b.logo, featured: !!b.featured };
}

export function normalizeCollection(c) {
  if (!c) return c;
  return { id: c._id, _id: c._id, name: c.name, slug: c.slug, image: c.image, description: c.description };
}

export function normalizeAttribute(a) {
  if (!a) return a;
  return { id: a._id, _id: a._id, type: a.type, name: a.name, value: a.value, colorSwatch: a.colorSwatch };
}

// SiteContent's schema field names already match what Home.jsx/Footer.jsx consume directly —
// this just strips Mongo metadata so components don't need to know about _id/__v/timestamps.
export function normalizeSiteContent(sc) {
  if (!sc) return sc;
  const { _id, __v, createdAt, updatedAt, ...rest } = sc;
  return rest;
}

export function normalizeBlog(b) {
  if (!b) return b;
  return {
    id: b.slug,
    _id: b._id,
    title: b.title,
    cat: b.category,
    excerpt: b.excerpt,
    content: b.content,
    date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    img: b.image,
  };
}

export function normalizeFaq(f) {
  if (!f) return f;
  return { cat: f.category, q: f.question, a: f.answer };
}

export function normalizeTestimonial(t) {
  if (!t) return t;
  return { name: t.name, country: t.country, quote: t.quote, rating: t.rating };
}

export function normalizeBanner(b) {
  if (!b) return b;
  return {
    id: b._id,
    title: b.title,
    subtitle: b.subtitle,
    img: b.image,
    ctaText: b.ctaText,
    ctaLink: b.ctaLink,
    placement: b.placement,
  };
}

export function normalizeReview(r) {
  if (!r) return r;
  return {
    id: r._id,
    name: r.name,
    rating: r.rating,
    comment: r.comment,
    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
  };
}