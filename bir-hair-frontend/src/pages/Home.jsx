import { useState } from 'react';
import { Link } from 'react-router-dom';
import PhotoBlock from '../components/PhotoBlock';
import CategoryCircle from '../components/CategoryCircle';
import ProductCard from '../components/ProductCard';
import CountdownTimer from '../components/CountdownTimer';
import Reveal from '../components/Reveal';
import StarRating from '../components/StarRating';
import { ProductGridSkeleton, LineSkeleton } from '../components/Skeletons';
import NewsletterForm from '../components/NewsletterForm';
import RecentlyViewed from '../components/RecentlyViewed';
import QuickView from '../components/QuickView';
import { useRecentlyViewedList } from '../hooks/useRecentlyViewed';
import { rupee } from '../lib/format';
import {
  useCategories, useProductsByBadge, useProducts, useTestimonials, useBlogs,
} from '../hooks/useStoreData';
import { beforeAfter, exportCountries, processSteps, certifications } from '../data/content';
import heroModel from '../assets/photos/hero-model.jpg';
import dealOfDayImg from '../assets/photos/deal-of-day.jpg';
import factorySorting from '../assets/photos/factory-sorting.jpg';
import factoryWefting from '../assets/photos/factory-wefting.jpg';
import factoryQc from '../assets/photos/factory-qc.jpg';
import factoryPacking from '../assets/photos/factory-packing.jpg';
import factoryStorage from '../assets/photos/factory-storage.jpg';
import factoryExport from '../assets/photos/factory-export.jpg';
import insta1 from '../assets/photos/insta-1.jpg';
import insta2 from '../assets/photos/insta-2.jpg';
import insta3 from '../assets/photos/insta-3.jpg';
import insta4 from '../assets/photos/insta-4.jpg';
import insta5 from '../assets/photos/insta-5.jpg';
import insta6 from '../assets/photos/insta-6.jpg';
import video1 from '../assets/photos/video-1.jpg';
import video2 from '../assets/photos/video-2.jpg';
import video3 from '../assets/photos/video-3.jpg';
import ba1Before from '../assets/photos/ba-1-before.jpg';
import ba1After from '../assets/photos/ba-1-after.jpg';
import ba2Before from '../assets/photos/ba-2-before.jpg';
import ba2After from '../assets/photos/ba-2-after.jpg';
import ba3Before from '../assets/photos/ba-3-before.jpg';
import ba3After from '../assets/photos/ba-3-after.jpg';
import ba4Before from '../assets/photos/ba-4-before.jpg';
import ba4After from '../assets/photos/ba-4-after.jpg';
import './Home.css';

const factoryGallery = [
  { label: 'Sorting Floor', img: factorySorting },
  { label: 'Wefting Studio', img: factoryWefting },
  { label: 'QC Bay', img: factoryQc },
  { label: 'Packing Line', img: factoryPacking },
  { label: 'Raw Storage', img: factoryStorage },
  { label: 'Export Dock', img: factoryExport },
];
const instaImages = [insta1, insta2, insta3, insta4, insta5, insta6];
const videoImages = [video1, video2, video3];
const baPairs = [
  [ba1Before, ba1After], [ba2Before, ba2After], [ba3Before, ba3After], [ba4Before, ba4After],
];

export default function Home() {
  const { categories } = useCategories();
  const { products: bestSellers } = useProductsByBadge('Bestseller');
  const { products: newArrivals } = useProductsByBadge('New');
  const { products: trending } = useProductsByBadge('Trending');
  const { products: gridProducts, loading: gridLoading } = useProducts({ limit: 8 });
  const { testimonials } = useTestimonials();
  const { blogs } = useBlogs();
  const recentlyViewed = useRecentlyViewedList();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const dealOfDay = bestSellers[0] || gridProducts[0];

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-inner">
          <div className="hero-copy reveal">
            <span className="eyebrow">Manufacturer · Exporter · Supplier — Est. 2014</span>
            <h1 className="hero-title">Pure Indian Remy Hair. <span className="gold-text">Crafted for Royalty.</span></h1>
            <p className="hero-sub">Factory-direct 100% human hair, ethically sourced from India — trusted by exporters in 50+ countries since 2014.</p>
            <div className="hero-ctas">
              <Link to="/shop" className="btn btn-gold">Shop Now</Link>
              <Link to="/about" className="btn btn-outline on-light">Explore Collection</Link>
            </div>
            <div className="hero-badges">
              {['100% Human Hair', 'Factory Direct', 'Worldwide Shipping', 'Manufacturer & Exporter'].map((b) => (
                <span key={b} className="hero-badge glass">{b}</span>
              ))}
            </div>
            <div className="hero-stats">
              <div><strong>2014</strong><span>Established</span></div>
              <div><strong>200+</strong><span>Artisans</span></div>
              <div><strong>50+</strong><span>Export Countries</span></div>
            </div>
          </div>
          <div className="hero-visual reveal" style={{ animationDelay: '150ms' }}>
            <div className="hero-visual-ring" />
            <PhotoBlock tone="gold" ratio="3/4" rounded={28} label="Featured" sub="Double-Drawn Body Wave" className="hero-visual-photo" src={heroModel} alt="Model with pure Indian Remy hair" />
            <div className="hero-visual-badge glass">
              <StarRating value={4.9} /> <span>4.9 from 3,200+ buyers</span>
            </div>
            <div className="hero-india-badge">
              <svg viewBox="0 0 120 120" className="hero-india-badge-svg" aria-hidden="true">
                <defs>
                  <radialGradient id="indiaBadgeFace" cx="34%" cy="28%" r="80%">
                    <stop offset="0%" stopColor="#4a332c" />
                    <stop offset="55%" stopColor="#2B1D17" />
                    <stop offset="100%" stopColor="#1a110d" />
                  </radialGradient>
                  <linearGradient id="indiaBadgeRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F3D97A" />
                    <stop offset="45%" stopColor="#C9A227" />
                    <stop offset="100%" stopColor="#8A6416" />
                  </linearGradient>
                  <linearGradient id="indiaBadgeMap" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F3D97A" />
                    <stop offset="55%" stopColor="#E6C76A" />
                    <stop offset="100%" stopColor="#C9A227" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="44" fill="url(#indiaBadgeRing)" />
                <circle cx="60" cy="60" r="39" fill="url(#indiaBadgeFace)" />
                <path
                  d="M60 29 C 50 30, 42 34, 39 41 C 36 48, 40 54, 38 62 C 36 70, 33 75, 37 81 C 40 86, 46 85, 50 91 C 53 95, 56 100, 60 104 C 64 99, 67 95, 71 90 C 75 85, 81 85, 84 79 C 87 74, 83 69, 85 62 C 87 55, 91 49, 87 42 C 83 35, 74 31, 66 29 Z"
                  fill="url(#indiaBadgeMap)"
                />
                <circle cx="73" cy="98" r="2" fill="url(#indiaBadgeMap)" />
              </svg>
              <span>Proudly<br />Made in India</span>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <Reveal as="section" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Shop by Category</span>
            <h2 className="section-title">Every texture, one factory floor</h2>
          </div>
          <div className="cat-row">
            {categories.map((c) => <CategoryCircle cat={c} key={c.id} />)}
          </div>
          <div className="cat-tags">
            {['Hair Type', 'Texture', 'Length', 'Color'].map((t) => (
              <Link to="/shop" key={t} className="cat-tag">Shop by {t}</Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* BEST SELLERS */}
      <ProductRow eyebrow="Customer Favourites" title="Best Sellers" list={bestSellers} onQuickView={setQuickViewProduct} />

      {/* FLASH SALE / DEAL OF DAY */}
      {dealOfDay && (
        <Reveal as="section" className="section deal-section">
          <div className="container deal-inner">
            <div className="deal-copy">
              <span className="eyebrow" style={{ color: 'var(--champagne)' }}>Flash Sale · Deal of the Day</span>
              <h2 className="section-title" style={{ color: 'var(--cream)' }}>{dealOfDay.name}</h2>
              <p className="deal-desc">A best-selling {(dealOfDay.texture || '').toLowerCase()} piece, hand-inspected at our Kirti Nagar factory before it ships — today only at factory-direct pricing.</p>
              <div className="deal-price">
                <span className="price-strike" style={{ color: 'rgba(248,244,237,0.5)' }}>{rupee(dealOfDay.mrp)}</span>
                <span className="price-now" style={{ color: 'var(--champagne)', fontSize: '1.7rem' }}>{rupee(dealOfDay.price)}</span>
              </div>
              <CountdownTimer hours={8} />
              <Link to={`/product/${dealOfDay.id}`} className="btn btn-gold" style={{ marginTop: 22 }}>Grab This Deal</Link>
            </div>
            <div className="deal-visual">
              <PhotoBlock tone="gold" ratio="4/5" rounded={24} label={`-${dealOfDay.discountPct || 20}%`} sub="Today Only" src={dealOfDayImg} alt={dealOfDay.name} />
            </div>
          </div>
        </Reveal>
      )}

      {/* COUPON BANNER */}
      <Reveal as="section" className="container">
        <div className="coupon-banner glass">
          <div>
            <span className="eyebrow">Luxury Coupon</span>
            <h3>Use code <span className="gold-text">BIRGOLD10</span> for 10% off your first bulk order</h3>
          </div>
          <Link to="/shop" className="btn btn-dark">Shop &amp; Save</Link>
        </div>
      </Reveal>

      <ProductRow eyebrow="Just Landed" title="New Arrivals" list={newArrivals} onQuickView={setQuickViewProduct} />
      <ProductRow eyebrow="What Everyone's Wearing" title="Trending Products" list={trending} onQuickView={setQuickViewProduct} />

      {/* PREMIUM GRID */}
      <Reveal as="section" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The Full Collection</span>
            <h2 className="section-title">Premium Product Grid</h2>
          </div>
          {gridLoading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="product-grid">
              {gridProducts.slice(0, 8).map((p, i) => (
                <ProductCard product={p} key={p.id} style={{ animationDelay: `${(i % 4) * 90}ms` }} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          )}
          <div className="center-cta"><Link to="/shop" className="btn btn-outline on-light">View Full Collection</Link></div>
        </div>
      </Reveal>

      {/* WHY CHOOSE US */}
      <Reveal as="section" className="section why-section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Why B.I.R Hair India Factory</span>
            <h2 className="section-title">Factory-direct, without the compromises</h2>
          </div>
          <div className="why-grid">
            {[
              ['No Middlemen', 'Every bundle ships straight from our Delhi factory floor to your door, at factory pricing.'],
              ['200+ Skilled Artisans', 'Hand-sorting and wefting done by a dedicated in-house team, not outsourced labour.'],
              ['Cuticle-Aligned Hair', 'Root-to-tip alignment on every bundle, preserving natural shine and reducing tangling.'],
              ['Export Since 2014', 'A decade of documented, compliant exports to distributors across 50+ countries.'],
            ].map(([t, d]) => (
              <div className="why-card card" key={t}>
                <div className="why-icon" />
                <h4>{t}</h4>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* PROCESS TIMELINE */}
      <Reveal as="section" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">From Source to Shipment</span>
            <h2 className="section-title">Our Manufacturing Process</h2>
          </div>
          <div className="process-row">
            {processSteps.map((s, i) => (
              <div className="process-step" key={s.step}>
                <span className="process-num">{String(i + 1).padStart(2, '0')}</span>
                <h4>{s.step}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* FACTORY GALLERY */}
      <Reveal as="section" className="section factory-gallery-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Kirti Nagar, Delhi</span>
            <h2 className="section-title">Inside Our Factory</h2>
          </div>
          <div className="gallery-grid">
            {factoryGallery.map((g, i) => (
              <PhotoBlock key={g.label} tone={['espresso','brown','gold','beige','cream','brown'][i]} ratio="1/1" rounded={16} label={g.label} src={g.img} alt={g.label} />
            ))}
          </div>
          <div className="center-cta"><Link to="/factory" className="btn btn-outline on-light">Take the Full Factory Tour</Link></div>
        </div>
      </Reveal>

      {/* CERTIFICATIONS */}
      <Reveal as="section" className="section cert-section">
        <div className="container cert-row">
          {certifications.map((c) => (
            <div className="cert-pill glass" key={c}>{c}</div>
          ))}
        </div>
      </Reveal>

      {/* EXPORT MAP */}
      <Reveal as="section" className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Worldwide Shipping</span>
            <h2 className="section-title">Exporting to 50+ Countries</h2>
          </div>
          <div className="export-countries">
            {exportCountries.map((c) => <span className="export-chip" key={c}>{c}</span>)}
            <span className="export-chip more">+ 38 more</span>
          </div>
        </div>
      </Reveal>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <Reveal as="section" className="section testi-section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Trusted Worldwide</span>
              <h2 className="section-title">Customer Testimonials</h2>
            </div>
            <div className="testi-grid">
              {testimonials.map((t) => (
                <div className="testi-card card" key={t.name}>
                  <StarRating value={t.rating} />
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <div className="testi-who">
                    <div className="testi-avatar" />
                    <div><strong>{t.name}</strong><span>{t.country}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* BEFORE AFTER */}
      <Reveal as="section" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Real Transformations</span>
            <h2 className="section-title">Before &amp; After</h2>
          </div>
          <div className="ba-grid">
            {beforeAfter.map((b, i) => (
              <div className="ba-card" key={b.title}>
                <div className="ba-split">
                  <PhotoBlock tone="beige" ratio="1/1" rounded={0} label="Before" strands={false} src={baPairs[i]?.[0]} alt={`${b.title} — before`} />
                  <PhotoBlock tone="gold" ratio="1/1" rounded={0} label="After" strands={false} src={baPairs[i]?.[1]} alt={`${b.title} — after`} />
                </div>
                <h4>{b.title}</h4>
                <span className="ba-tag">{b.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* INSTAGRAM + VIDEO REVIEWS */}
      <Reveal as="section" className="section insta-section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">@birhairindiafactory</span>
            <h2 className="section-title">From Our Instagram</h2>
          </div>
          <div className="insta-grid">
            {instaImages.map((img, i) => (
              <PhotoBlock key={i} tone={['gold','beige','brown','cream','espresso','gold'][i]} ratio="1/1" rounded={12} src={img} alt="Bir Hair India Factory on Instagram" />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Watch &amp; Believe</span>
            <h2 className="section-title">Video Reviews</h2>
          </div>
          <div className="video-row">
            {videoImages.map((img, i) => (
              <div className="video-card" key={i}>
                <PhotoBlock tone="espresso" ratio="9/16" rounded={18} strands={false} src={img} alt="Customer video review" />
                <span className="video-play">▶</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* BLOGS */}
      {blogs.length > 0 && (
        <Reveal as="section" className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">The Journal</span>
              <h2 className="section-title">Latest From The Blog</h2>
            </div>
            <div className="blog-row">
              {blogs.slice(0, 3).map((b) => (
                <Link to={`/journal/${b.id}`} className="blog-card card" key={b.id}>
                  <PhotoBlock tone="beige" ratio="16/10" rounded={0} label={b.cat} src={b.img} alt={b.title} />
                  <div className="blog-card-body">
                    <span className="eyebrow">{b.date}</span>
                    <h4>{b.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* FAQ TEASER */}
      <Reveal as="section" className="section faq-teaser">
        <div className="container faq-teaser-inner">
          <div>
            <span className="eyebrow">Have Questions?</span>
            <h2 className="section-title">We've Got Answers</h2>
            <p className="section-lede">Shipping timelines, hair care, returns and bulk export terms — all in one place.</p>
          </div>
          <Link to="/faq" className="btn btn-gold">Visit FAQ</Link>
        </div>
      </Reveal>

      <RecentlyViewed items={recentlyViewed} />

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* NEWSLETTER */}
      <Reveal as="section" className="newsletter-section">
        <div className="container newsletter-inner">
          <span className="eyebrow" style={{ color: 'var(--champagne)' }}>Stay In The Loop</span>
          <h2 className="section-title" style={{ color: 'var(--cream)' }}>Join the B.I.R Hair Circle</h2>
          <p style={{ color: 'rgba(248,244,237,0.7)', marginBottom: 22 }}>New drops, factory stories and export-only offers — straight to your inbox.</p>
          <NewsletterForm />
        </div>
      </Reveal>
    </>
  );
}

function ProductRow({ eyebrow, title, list, onQuickView }) {
  if (!list.length) return null;
  return (
    <Reveal as="section" className="section">
      <div className="container">
        <div className="section-head row">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="section-title">{title}</h2>
          </div>
          <Link to="/shop" className="btn btn-outline on-light">View All</Link>
        </div>
        <div className="product-scroll">
          {list.map((p) => <ProductCard product={p} key={p.id} onQuickView={onQuickView} />)}
        </div>
      </div>
    </Reveal>
  );
}
