import { useState } from 'react';
import { Link } from 'react-router-dom';
import PhotoBlock from '../components/PhotoBlock';
import CategoryCircle from '../components/CategoryCircle';
import ProductCard from '../components/ProductCard';
import CountdownTimer from '../components/CountdownTimer';
import Reveal from '../components/Reveal';
import StarRating from '../components/StarRating';
import { ProductGridSkeleton } from '../components/Skeletons';
import NewsletterForm from '../components/NewsletterForm';
import RecentlyViewed from '../components/RecentlyViewed';
import QuickView from '../components/QuickView';
import { useRecentlyViewedList } from '../hooks/useRecentlyViewed';
import { rupee } from '../lib/format';
import {
  useCategories, useProductsByBadge, useProductsByFlag, useProducts, useCollections,
  useTestimonials, useBlogs, useSiteContent,
} from '../hooks/useStoreData';
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

// Bundled fallback assets — used only when the admin hasn't uploaded content of their own yet,
// so the page always renders something polished instead of a blank section.
const FALLBACK_FACTORY_GALLERY = [
  { label: 'Sorting Floor', image: factorySorting },
  { label: 'Wefting Studio', image: factoryWefting },
  { label: 'QC Bay', image: factoryQc },
  { label: 'Packing Line', image: factoryPacking },
  { label: 'Raw Storage', image: factoryStorage },
  { label: 'Export Dock', image: factoryExport },
];
const FALLBACK_INSTAGRAM = [insta1, insta2, insta3, insta4, insta5, insta6];
const FALLBACK_VIDEOS = [video1, video2, video3];
const FALLBACK_BEFORE_AFTER = [
  { title: 'Thin ends to full length', tag: '18" Body Wave', beforeImage: ba1Before, afterImage: ba1After },
  { title: 'Damaged crown restored', tag: 'Silk Top Wig', beforeImage: ba2Before, afterImage: ba2After },
  { title: 'Bleach-friendly blonde', tag: '#613 Frontal', beforeImage: ba3Before, afterImage: ba3After },
  { title: 'Everyday sew-in glow up', tag: '22" Straight Bundle', beforeImage: ba4Before, afterImage: ba4After },
];

/** Merges the legacy single `badge` shelf with the new admin-panel boolean flag,
 *  so stores that only set one of the two still see full shelves (de-duplicated by id). */
function mergeShelf(flagList = [], badgeList = []) {
  const seen = new Set(flagList.map((p) => p.id));
  return [...flagList, ...badgeList.filter((p) => !seen.has(p.id))];
}

export default function Home() {
  const { siteContent: sc } = useSiteContent();
  const { categories } = useCategories();
  const { collections } = useCollections();

  const { products: bestSellerFlag } = useProductsByFlag('bestSeller');
  const { products: bestSellerBadge } = useProductsByBadge('Bestseller');
  const bestSellers = mergeShelf(bestSellerFlag, bestSellerBadge);

  const { products: newArrivalFlag } = useProductsByFlag('newArrival');
  const { products: newArrivalBadge } = useProductsByBadge('New');
  const newArrivals = mergeShelf(newArrivalFlag, newArrivalBadge);

  const { products: trendingFlag } = useProductsByFlag('trending');
  const { products: trendingBadge } = useProductsByBadge('Trending');
  const trending = mergeShelf(trendingFlag, trendingBadge);

  const { products: premium } = useProductsByFlag('premium');
  const { products: featuredProducts } = useProductsByFlag('featured');
  const { products: flashSaleProducts } = useProductsByFlag('flashSale');

  const { products: gridProducts, loading: gridLoading } = useProducts({ limit: 8 });
  const { testimonials } = useTestimonials();
  const { blogs } = useBlogs();
  const recentlyViewed = useRecentlyViewedList();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const featuredCategories = categories.filter((c) => c.featured);
  const dealOfDay = flashSaleProducts[0] || bestSellers[0] || gridProducts[0];

  // Section visibility is admin-controlled (Website Content -> Home Sections). Defaults to
  // shown while loading / if a key is missing so the page never blanks out unexpectedly.
  const sectionEnabled = (key) => {
    if (!sc?.homeSections) return true;
    const entry = sc.homeSections.find((s) => s.key === key);
    return entry ? entry.enabled !== false : true;
  };

  const hero = sc?.hero || {};
  const heroBadges = hero.badges?.length ? hero.badges : ['100% Human Hair', 'Factory Direct', 'Worldwide Shipping', 'Manufacturer & Exporter'];
  const heroStats = hero.stats?.length ? hero.stats : [{ value: '2014', label: 'Established' }, { value: '200+', label: 'Artisans' }, { value: '50+', label: 'Export Countries' }];

  const why = sc?.whyChooseUs || {};
  const whyItems = why.items?.length ? why.items : [
    { title: 'No Middlemen', description: 'Every bundle ships straight from our Delhi factory floor to your door, at factory pricing.' },
    { title: '200+ Skilled Artisans', description: 'Hand-sorting and wefting done by a dedicated in-house team, not outsourced labour.' },
    { title: 'Cuticle-Aligned Hair', description: 'Root-to-tip alignment on every bundle, preserving natural shine and reducing tangling.' },
    { title: 'Export Since 2014', description: 'A decade of documented, compliant exports to distributors across 50+ countries.' },
  ];

  const processSteps = sc?.processSteps?.length ? sc.processSteps : [];
  const gallery = sc?.factoryGallery || {};
  const galleryImages = gallery.images?.length ? gallery.images : FALLBACK_FACTORY_GALLERY;
  const certifications = sc?.certifications?.length ? sc.certifications : [
    'ISO 9001:2015 Certified Facility', '100% Cuticle-Aligned Human Hair', 'Ethically Sourced & Traceable', 'Export Compliance Verified',
  ];
  const exportCountries = sc?.exportCountries?.length ? sc.exportCountries : ['USA', 'UK', 'Nigeria', 'UAE', 'South Africa', 'Brazil', 'France', 'Kenya', 'Canada', 'Ghana', 'Jamaica', 'Germany'];
  const beforeAfter = sc?.beforeAfter?.length ? sc.beforeAfter : FALLBACK_BEFORE_AFTER;
  const instaHandle = sc?.instagram?.handle || '@birhairindiafactory';
  const instaImages = sc?.instagram?.images?.length ? sc.instagram.images : FALLBACK_INSTAGRAM;
  const videoImages = sc?.videoReviews?.length ? sc.videoReviews : FALLBACK_VIDEOS;
  const coupon = sc?.couponBanner || {};
  const faqTeaser = sc?.faqTeaser || {};
  const newsletterSection = sc?.newsletterSection || {};

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-inner">
          <div className="hero-copy reveal">
            <span className="eyebrow">{hero.eyebrow || 'Manufacturer · Exporter · Supplier — Est. 2014'}</span>
            <h1 className="hero-title">
              {hero.title || 'Pure Indian Remy Hair.'} <span className="gold-text">{hero.highlightText || 'Crafted for Royalty.'}</span>
            </h1>
            <p className="hero-sub">{hero.subtitle || 'Factory-direct 100% human hair, ethically sourced from India — trusted by exporters in 50+ countries since 2014.'}</p>
            <div className="hero-ctas">
              <Link to={hero.primaryCtaLink || '/shop'} className="btn btn-gold">{hero.primaryCtaText || 'Shop Now'}</Link>
              <Link to={hero.secondaryCtaLink || '/about'} className="btn btn-outline on-light">{hero.secondaryCtaText || 'Explore Collection'}</Link>
            </div>
            <div className="hero-badges">
              {heroBadges.map((b) => (
                <span key={b} className="hero-badge glass">{b}</span>
              ))}
            </div>
            <div className="hero-stats">
              {heroStats.map((s) => (
                <div key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>
              ))}
            </div>
          </div>
          <div className="hero-visual reveal" style={{ animationDelay: '150ms' }}>
            <div className="hero-visual-ring" />
            <PhotoBlock tone="gold" ratio="3/4" rounded={28} label="Featured" sub="Double-Drawn Body Wave" className="hero-visual-photo" src={hero.image || heroModel} alt="Model with pure Indian Remy hair" />
            <div className="hero-visual-badge glass">
              <StarRating value={hero.ratingValue ?? 4.9} /> <span>{hero.ratingLabel || '4.9 from 3,200+ buyers'}</span>
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
      {sectionEnabled('categories') && (
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
      )}

      {/* FEATURED CATEGORIES */}
      {sectionEnabled('featuredCategories') && featuredCategories.length > 0 && (
        <Reveal as="section" className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Handpicked by the Factory</span>
              <h2 className="section-title">Featured Categories</h2>
            </div>
            <div className="cat-row">
              {featuredCategories.map((c) => <CategoryCircle cat={c} key={c.id} />)}
            </div>
          </div>
        </Reveal>
      )}

      {/* BEST SELLERS */}
      {sectionEnabled('bestSellers') && (
        <ProductRow eyebrow="Customer Favourites" title="Best Sellers" list={bestSellers} onQuickView={setQuickViewProduct} />
      )}

      {/* FLASH SALE / DEAL OF DAY */}
      {sectionEnabled('flashSale') && dealOfDay && (
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
              <CountdownTimer hours={8} endsAt={dealOfDay.flashSaleEndsAt} />
              <Link to={`/product/${dealOfDay.id}`} className="btn btn-gold" style={{ marginTop: 22 }}>Grab This Deal</Link>
            </div>
            <div className="deal-visual">
              <PhotoBlock tone="gold" ratio="4/5" rounded={24} label={dealOfDay.saleBadgeText || `-${dealOfDay.discountPct || 20}%`} sub="Today Only" src={dealOfDay.image || dealOfDayImg} alt={dealOfDay.name} />
            </div>
          </div>
        </Reveal>
      )}

      {/* Additional Flash Sale shelf (all flash-sale-tagged products, beyond the single deal-of-day) */}
      {sectionEnabled('flashSale') && flashSaleProducts.length > 1 && (
        <ProductRow eyebrow="Limited Time" title="Flash Sale" list={flashSaleProducts} onQuickView={setQuickViewProduct} />
      )}

      {/* COUPON BANNER */}
      {coupon.enabled !== false && (
        <Reveal as="section" className="container">
          <div className="coupon-banner glass">
            <div>
              <span className="eyebrow">{coupon.eyebrow || 'Luxury Coupon'}</span>
              <h3>Use code <span className="gold-text">{coupon.code || 'BIRGOLD10'}</span> for {coupon.discountText || '10%'} {coupon.title || 'off your first bulk order'}</h3>
            </div>
            <Link to={coupon.ctaLink || '/shop'} className="btn btn-dark">{coupon.ctaText || 'Shop & Save'}</Link>
          </div>
        </Reveal>
      )}

      {sectionEnabled('newArrivals') && (
        <ProductRow eyebrow="Just Landed" title="New Arrivals" list={newArrivals} onQuickView={setQuickViewProduct} />
      )}
      {sectionEnabled('trending') && (
        <ProductRow eyebrow="What Everyone's Wearing" title="Trending Products" list={trending} onQuickView={setQuickViewProduct} />
      )}
      {sectionEnabled('premium') && premium.length > 0 && (
        <ProductRow eyebrow="The Finest Selection" title="Premium Products" list={premium} onQuickView={setQuickViewProduct} />
      )}
      {sectionEnabled('featuredProducts') && featuredProducts.length > 0 && (
        <ProductRow eyebrow="Editor's Pick" title="Featured Products" list={featuredProducts} onQuickView={setQuickViewProduct} />
      )}

      {/* COLLECTIONS */}
      {sectionEnabled('collections') && collections.length > 0 && (
        <Reveal as="section" className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Curated Edits</span>
              <h2 className="section-title">Shop by Collection</h2>
            </div>
            <div className="gallery-grid">
              {collections.map((c, i) => (
                <Link to={`/shop?collection=${c.slug || c.id}`} key={c.id}>
                  <PhotoBlock tone={['espresso', 'brown', 'gold', 'beige', 'cream', 'brown'][i % 6]} ratio="1/1" rounded={16} label={c.name} src={c.image} alt={c.name} />
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}

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
            <span className="eyebrow">{why.eyebrow || 'Why B.I.R Hair India Factory'}</span>
            <h2 className="section-title">{why.title || 'Factory-direct, without the compromises'}</h2>
          </div>
          <div className="why-grid">
            {whyItems.map((item) => (
              <div className="why-card card" key={item.title}>
                <div className="why-icon" />
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* PROCESS TIMELINE */}
      {processSteps.length > 0 && (
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
      )}

      {/* FACTORY GALLERY */}
      <Reveal as="section" className="section factory-gallery-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{gallery.eyebrow || 'Kirti Nagar, Delhi'}</span>
            <h2 className="section-title">{gallery.title || 'Inside Our Factory'}</h2>
          </div>
          <div className="gallery-grid">
            {galleryImages.map((g, i) => (
              <PhotoBlock key={g.label || i} tone={['espresso', 'brown', 'gold', 'beige', 'cream', 'brown'][i % 6]} ratio="1/1" rounded={16} label={g.label} src={g.image} alt={g.label || 'Factory'} />
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
          </div>
        </div>
      </Reveal>

      {/* TESTIMONIALS */}
      {sectionEnabled('testimonials') && testimonials.length > 0 && (
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
      {beforeAfter.length > 0 && (
        <Reveal as="section" className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Real Transformations</span>
              <h2 className="section-title">Before &amp; After</h2>
            </div>
            <div className="ba-grid">
              {beforeAfter.map((b) => (
                <div className="ba-card" key={b.title}>
                  <div className="ba-split">
                    <PhotoBlock tone="beige" ratio="1/1" rounded={0} label="Before" strands={false} src={b.beforeImage} alt={`${b.title} — before`} />
                    <PhotoBlock tone="gold" ratio="1/1" rounded={0} label="After" strands={false} src={b.afterImage} alt={`${b.title} — after`} />
                  </div>
                  <h4>{b.title}</h4>
                  <span className="ba-tag">{b.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* INSTAGRAM + VIDEO REVIEWS */}
      <Reveal as="section" className="section insta-section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{instaHandle}</span>
            <h2 className="section-title">From Our Instagram</h2>
          </div>
          <div className="insta-grid">
            {instaImages.map((img, i) => (
              <PhotoBlock key={i} tone={['gold', 'beige', 'brown', 'cream', 'espresso', 'gold'][i % 6]} ratio="1/1" rounded={12} src={img} alt="Bir Hair India Factory on Instagram" />
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
            <span className="eyebrow">{faqTeaser.eyebrow || 'Have Questions?'}</span>
            <h2 className="section-title">{faqTeaser.title || "We've Got Answers"}</h2>
            <p className="section-lede">{faqTeaser.description || 'Shipping timelines, hair care, returns and bulk export terms — all in one place.'}</p>
          </div>
          <Link to="/faq" className="btn btn-gold">{faqTeaser.ctaText || 'Visit FAQ'}</Link>
        </div>
      </Reveal>

      <RecentlyViewed items={recentlyViewed} />

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* NEWSLETTER */}
      <Reveal as="section" className="newsletter-section">
        <div className="container newsletter-inner">
          <span className="eyebrow" style={{ color: 'var(--champagne)' }}>{newsletterSection.eyebrow || 'Stay In The Loop'}</span>
          <h2 className="section-title" style={{ color: 'var(--cream)' }}>{newsletterSection.title || 'Join the B.I.R Hair Circle'}</h2>
          <p style={{ color: 'rgba(248,244,237,0.7)', marginBottom: 22 }}>{newsletterSection.description || 'New drops, factory stories and export-only offers — straight to your inbox.'}</p>
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
