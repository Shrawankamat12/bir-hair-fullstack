import { useState } from 'react';
import { FiPlay, FiChevronRight, FiChevronLeft, FiTruck, FiHeadphones, FiRefreshCw, FiShield, FiDroplet, FiClock, FiMoon, FiLock, FiGift, FiUsers, FiHelpCircle } from 'react-icons/fi';
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
const HAIR_LENGTHS = ['10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"', '40"'];

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
  const faqItems = faqTeaser.items?.length ? faqTeaser.items : [
    { q: 'How long does shipping take?', a: 'Orders are usually delivered within 3-5 business days.' },
    { q: 'Can I return or exchange my order?', a: 'Yes, we offer 30 days return & exchange policy.' },
    { q: 'How do I care for my hair?', a: 'Treat it like your own hair and use sulfate-free products.' },
    { q: 'Is your hair 100% human hair?', a: 'Yes, all our hair is 100% virgin human hair.' },
  ];
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
                    <stop offset="0%" stopColor="#3d1128" />
                    <stop offset="55%" stopColor="#2B0F1F" />
                    <stop offset="100%" stopColor="#1a110d" />
                  </radialGradient>
                  <linearGradient id="indiaBadgeRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD4E8" />
                    <stop offset="45%" stopColor="#F85D9B" />
                    <stop offset="100%" stopColor="#C2185B" />
                  </linearGradient>
                  <linearGradient id="indiaBadgeMap" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD4E8" />
                    <stop offset="55%" stopColor="#F7B9D3" />
                    <stop offset="100%" stopColor="#F85D9B" />
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

      {/* TRUST ICON STRIP — matches the "100% Human Hair / Can Be Dyed / Long Lasting / Healthy Ends / Secure Payment" row under the hero in the reference layout */}
      <section className="bg-pink-50 py-5">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: FiDroplet, title: '100% Human Hair', sub: 'No Synthetic Mix' },
            { icon: FiRefreshCw, title: 'Can Be Dyed', sub: 'Bleached & Styled' },
            { icon: FiClock, title: 'Long Lasting', sub: 'Durable & Soft' },
            { icon: FiMoon, title: 'Healthy Ends', sub: 'Full & Thick Ends' },
            { icon: FiLock, title: 'Secure Payment', sub: '100% Safe & Secure' },
          ].map(({ icon: Icon, title, sub }) => (
            <div className="flex items-center gap-2.5 text-sm" key={title}>
              <Icon className="text-pink-600 text-xl shrink-0" />
              <div>
                <strong className="block text-sm text-gray-800">{title}</strong>
                <span className="block text-xs text-gray-500">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROMO STRIP — 3 cards: new customer / bundle deals / refer & earn (matches reference layout) */}
      <Reveal as="section" className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50 p-6">
            <span className="text-pink-600 text-xs font-bold uppercase tracking-wide">{coupon.eyebrow || 'New Customers'}</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">Get {coupon.discountText || '10%'} Off</h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">On your first order — use code <strong>{coupon.code || 'BIRGOLD10'}</strong></p>
            <Link to={coupon.ctaLink || '/shop'} className="inline-block bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition">Shop Now</Link>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 p-6">
            <span className="text-rose-600 text-xs font-bold uppercase tracking-wide">Bundle Deals</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">Save More</h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">When you buy more — bigger bundles unlock deeper pricing.</p>
            <Link to="/shop" className="inline-block border border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white text-sm font-semibold px-5 py-2.5 rounded-full transition">Shop Bundles</Link>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 p-6">
            <span className="text-amber-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5"><FiGift /> Refer & Earn</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">Get $20</h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">For every friend you refer to B.I.R Hair.</p>
            <Link to="/referrals" className="inline-block border border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white text-sm font-semibold px-5 py-2.5 rounded-full transition">Learn More</Link>
          </div>
        </div>
      </Reveal>

      {/* SHOP BY CATEGORY */}
      {sectionEnabled('categories') && (
        <Reveal as="section" className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Shop by Category</span>
              <h2 className="section-title">Every texture, one factory floor</h2>
            </div>
            <div className="cat-row cat-row--grid">
              {categories.map((c) => <CategoryCircle cat={c} key={c.id} variant="card" />)}
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
            <div className="cat-row cat-row--grid cat-row--collections">
              {featuredCategories.map((c) => <CategoryCircle cat={c} key={c.id} variant="card" />)}
            </div>
          </div>
        </Reveal>
      )}

      {/* BEST SELLERS — carousel row with view-all, matches reference layout position right after promo cards */}
      {sectionEnabled('bestSellers') && (
        <ProductRow eyebrow="Customer Favourites" title="Best Sellers" list={bestSellers} onQuickView={setQuickViewProduct} scroller />
      )}

      {/* SECONDARY TRUST STRIP — worldwide shipping / 24-7 support / easy returns / secure checkout, matches reference layout's second icon band */}
      <section className="bg-white border-y border-gray-100 py-5">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FiTruck, title: 'Worldwide Shipping', sub: 'Fast & Reliable Delivery' },
            { icon: FiHeadphones, title: '24/7 Customer Support', sub: "We're Here to Help" },
            { icon: FiRefreshCw, title: '30 Days Easy Returns', sub: 'Hassle Free Returns' },
            { icon: FiShield, title: 'Secure Checkout', sub: 'SSL Encrypted Payment' },
          ].map(({ icon: Icon, title, sub }) => (
            <div className="flex items-center gap-2.5 text-sm" key={title}>
              <Icon className="text-pink-600 text-xl shrink-0" />
              <div>
                <strong className="block text-sm text-gray-800">{title}</strong>
                <span className="block text-xs text-gray-500">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS + FLASH SALE — 2-column split matching reference layout (product grid left, countdown card right) */}
      {(sectionEnabled('newArrivals') || sectionEnabled('flashSale')) && (
        <Reveal as="section" className="section">
          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
            {sectionEnabled('newArrivals') && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="eyebrow">Just Landed</span>
                    <h2 className="section-title">New Arrivals</h2>
                  </div>
                  <Link to="/shop" className="border border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white text-sm font-semibold px-4 py-2 rounded-full transition">View All</Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {newArrivals.slice(0, 4).map((p) => (
                    <ProductCard product={p} key={p.id} onQuickView={setQuickViewProduct} />
                  ))}
                </div>
              </div>
            )}
            {sectionEnabled('flashSale') && dealOfDay && (
              <div className="rounded-2xl bg-pink-950 text-white p-6">
                <span className="font-bold text-amber-200">⚡ Flash Sale</span>
                <p className="text-white/70 text-sm mt-1 mb-3.5">Limited Time Offer</p>
                <CountdownTimer hours={8} endsAt={dealOfDay.flashSaleEndsAt} />
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-20 shrink-0">
                    <PhotoBlock tone="gold" ratio="1/1" rounded={16} src={dealOfDay.image || dealOfDayImg} alt={dealOfDay.name} />
                  </div>
                  <div>
                    <h4 className="text-sm mb-1.5">{dealOfDay.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="line-through text-white/50 text-sm">{rupee(dealOfDay.mrp)}</span>
                      <span className="text-amber-200 text-lg font-bold">{rupee(dealOfDay.price)}</span>
                    </div>
                  </div>
                </div>
                <Link to={`/product/${dealOfDay.id}`} className="block text-center bg-amber-300 hover:bg-amber-400 text-pink-950 font-semibold rounded-full py-2.5 mt-4 transition">Shop Now</Link>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* Additional Flash Sale shelf (all flash-sale-tagged products, beyond the single deal-of-day) */}
      {sectionEnabled('flashSale') && flashSaleProducts.length > 1 && (
        <ProductRow eyebrow="Limited Time" title="Flash Sale" list={flashSaleProducts} onQuickView={setQuickViewProduct} scroller />
      )}

      {sectionEnabled('trending') && (
        <ProductRow eyebrow="What Everyone's Wearing" title="Trending Products" list={trending} onQuickView={setQuickViewProduct} scroller />
      )}
      {sectionEnabled('premium') && premium.length > 0 && (
        <ProductRow eyebrow="The Finest Selection" title="Premium Products" list={premium} onQuickView={setQuickViewProduct} scroller />
      )}
      {sectionEnabled('featuredProducts') && featuredProducts.length > 0 && (
        <ProductRow eyebrow="Editor's Pick" title="Featured Products" list={featuredProducts} onQuickView={setQuickViewProduct} scroller />
      )}

      {/* SHOP BY LENGTH — pill row, matches reference layout */}
      <Reveal as="section" className="section">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="eyebrow">Find Your Fit</span>
              <h2 className="section-title">Shop By Length</h2>
            </div>
            <Link to="/shop" className="border border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white text-sm font-semibold px-4 py-2 rounded-full transition">View All</Link>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {HAIR_LENGTHS.map((len) => (
              <Link
                to={`/shop?length=${encodeURIComponent(len)}`}
                key={len}
                className="border border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white text-sm font-semibold rounded-full px-4.5 py-2.5 transition"
              >
                {len}
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

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

      {/* WHY CHOOSE US + BEFORE/AFTER — 2-column split, matches reference layout */}
      <Reveal as="section" className="section why-section">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div>
            <span className="eyebrow">{why.eyebrow || 'Why Choose B.I.R Hair?'}</span>
            <h2 className="section-title">{why.title || 'Factory-direct, without the compromises'}</h2>
            <ul className="list-none p-0 mt-4.5 flex flex-col gap-3.5">
              {whyItems.map((item) => (
                <li className="flex flex-col gap-0.5" key={item.title}>
                  <strong className="before:content-['✓_'] before:text-pink-600">{item.title}</strong>
                  <span className="text-sm text-gray-500 ml-4.5">{item.description}</span>
                </li>
              ))}
            </ul>
            <Link to="/about" className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-full mt-4.5 transition">Learn More</Link>
          </div>
          <div>
            <span className="eyebrow">Real Transformations</span>
            <h2 className="section-title">Before &amp; After</h2>
            {beforeAfter.slice(0, 1).map((b) => (
              <div className="grid grid-cols-2 gap-3 mt-4" key={b.title}>
                <PhotoBlock tone="beige" ratio="4/5" rounded={16} label="Before" strands={false} src={b.beforeImage} alt={`${b.title} — before`} />
                <PhotoBlock tone="gold" ratio="4/5" rounded={16} label="After" strands={false} src={b.afterImage} alt={`${b.title} — after`} />
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

      {/* TESTIMONIALS — matches reference layout's "What Our Customers Say" row */}
      {sectionEnabled('testimonials') && testimonials.length > 0 && (
        <Reveal as="section" className="section testi-section">
          <div className="container">
            <div className="section-head row">
              <div>
                <span className="eyebrow">Trusted Worldwide</span>
                <h2 className="section-title">What Our Customers Say</h2>
              </div>
              <Link to="/reviews" className="btn btn-outline on-light btn-sm">View All Reviews</Link>
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

      {/* FULL BEFORE/AFTER GRID */}
      {beforeAfter.length > 1 && (
        <Reveal as="section" className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">More Transformations</span>
              <h2 className="section-title">Before &amp; After Gallery</h2>
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

      {/* INSTAGRAM — matches reference layout "Follow Us On Instagram" grid */}
      <Reveal as="section" className="section insta-section">
        <div className="container">
          <div className="section-head row">
            <div>
              <span className="eyebrow">{instaHandle}</span>
              <h2 className="section-title">Follow Us On Instagram</h2>
            </div>
            <Link to="/gallery" className="btn btn-outline on-light btn-sm">View All</Link>
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
                <span className="video-play"><FiPlay /></span>
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

      {/* FAQ — 4-item grid, matches reference layout (not just a teaser link) */}
      <Reveal as="section" className="section">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="eyebrow">{faqTeaser.eyebrow || 'Have Questions?'}</span>
              <h2 className="section-title">{faqTeaser.title || 'Frequently Asked Questions'}</h2>
            </div>
            <Link to="/faq" className="border border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white text-sm font-semibold px-4 py-2 rounded-full transition">View All FAQs</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {faqItems.map((f) => (
              <Link to="/faq" className="block card p-5 hover:shadow-md transition" key={f.q}>
                <FiHelpCircle className="text-pink-600 text-2xl mb-2.5" />
                <h4 className="text-sm font-semibold mb-1.5 text-gray-800">{f.q}</h4>
                <p className="text-xs text-gray-500">{f.a}</p>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <RecentlyViewed items={recentlyViewed} />

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* NEWSLETTER / VIP LIST — matches reference layout's "Join Our VIP List" banner */}
      <Reveal as="section" className="newsletter-section">
        <div className="container newsletter-inner">
          <span className="eyebrow" style={{ color: 'var(--champagne)' }}>{newsletterSection.eyebrow || 'Join Our VIP List'}</span>
          <h2 className="section-title" style={{ color: 'var(--cream)' }}>{newsletterSection.title || 'Join the B.I.R Hair Circle'}</h2>
          <p style={{ color: 'rgba(255, 249, 252,0.7)', marginBottom: 18 }}>{newsletterSection.description || 'Get exclusive offers, new arrivals & beauty tips — straight to your inbox.'}</p>
          <NewsletterForm />
          <div className="flex flex-wrap gap-5 justify-center mt-5">
            <span className="flex items-center gap-1.5 text-sm text-white/85"><FiGift /> Exclusive Discounts</span>
            <span className="flex items-center gap-1.5 text-sm text-white/85"><FiClock /> New Arrivals</span>
            <span className="flex items-center gap-1.5 text-sm text-white/85"><FiDroplet /> Beauty Tips</span>
            <span className="flex items-center gap-1.5 text-sm text-white/85"><FiUsers /> Giveaways</span>
          </div>
        </div>
      </Reveal>
    </>
  );
}

function ProductRow({ eyebrow, title, list, onQuickView, scroller }) {
  if (!list.length) return null;
  return (
    <Reveal as="section" className="section">
      <div className="container">
        <div className="section-head row">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="section-title">{title}</h2>
          </div>
          <Link to="/shop" className="btn btn-outline on-light">View All Products <FiChevronRight /></Link>
        </div>
        <div className={scroller ? 'product-scroll product-scroll--arrows' : 'product-scroll'}>
          {list.map((p) => <ProductCard product={p} key={p.id} onQuickView={onQuickView} />)}
        </div>
      </div>
    </Reveal>
  );
}