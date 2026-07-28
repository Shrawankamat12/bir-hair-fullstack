// The storefront UI (ProductCard, Cart, ProductDetail, etc.) was originally built
// against src/data/products.js's plain object shapes. Rather than rewrite every
// component's JSX, we normalize API responses into those same shapes here —
// one place to update if the contract ever changes.

export function normalizeProduct(p) {
  if (!p) return p;
  return {
    id: p._id,
    slug: p.slug,
    name: p.name,
    category: p.category?.slug || p.category,
    categoryName: p.category?.name,
    texture: p.texture,
    hairType: p.hairType,
    length: p.length,
    color: p.color,
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
    image: p.images?.[0],
    images: p.images || [],
  };
}

export function normalizeCategory(c) {
  if (!c) return c;
  return { id: c.slug, _id: c._id, name: c.name, tone: c.tone, tag: c.tag, img: c.image };
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
