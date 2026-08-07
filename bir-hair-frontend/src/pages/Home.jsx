import { useState } from 'react';
import { FiPlay, FiChevronRight, FiGift, FiClock, FiDroplet, FiUsers, FiHelpCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PhotoBlock from '../components/PhotoBlock';
import CategoryCircle from '../components/CategoryCircle';
import ProductCard from '../components/ProductCard';
import CountdownTimer from '../components/CountdownTimer';
import TrustBadges from '../components/TrustBadges';
import Reveal from '../components/Reveal';
import StarRating from '../components/StarRating';
import { ProductGridSkeleton } from '../components/Skeletons';
import NewsletterForm from '../components/NewsletterForm';
import RecentlyViewed from '../components/RecentlyViewed';
import QuickView from '../components/QuickView';
import { useRecentlyViewedList } from '../hooks/useRecentlyViewed';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
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
  const galleryImages = gallery.images?.length
    ? gallery.images.map((g) => ({ ...g, image: resolveImageUrl(g.image) }))
    : FALLBACK_FACTORY_GALLERY;
  const certifications = sc?.certifications?.length ? sc.certifications : [
    'ISO 9001:2015 Certified Facility', '100% Cuticle-Aligned Human Hair', 'Ethically Sourced & Traceable', 'Export Compliance Verified',
  ];
  const exportCountries = sc?.exportCountries?.length ? sc.exportCountries : ['USA', 'UK', 'Nigeria', 'UAE', 'South Africa', 'Brazil', 'France', 'Kenya', 'Canada', 'Ghana', 'Jamaica', 'Germany'];
  const beforeAfter = sc?.beforeAfter?.length
    ? sc.beforeAfter.map((b) => ({ ...b, beforeImage: resolveImageUrl(b.beforeImage), afterImage: resolveImageUrl(b.afterImage) }))
    : FALLBACK_BEFORE_AFTER;
  const instaHandle = sc?.instagram?.handle || '@birhairindiafactory';
  const instaImages = sc?.instagram?.images?.length
    ? sc.instagram.images.map((img) => resolveImageUrl(img))
    : FALLBACK_INSTAGRAM;
  const videoImages = sc?.videoReviews?.length
    ? sc.videoReviews.map((img) => resolveImageUrl(img))
    : FALLBACK_VIDEOS;
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
    {/* ========================= HERO ========================= */}
<section className="relative overflow-hidden bg-white pt-3">
  {/* ================= HERO BACKGROUND ================= */}
  <div className="absolute inset-x-3 top-3 bottom-0 rounded-[22px] bg-gradient-to-br from-[#fff9fb] via-[#fff0f5] to-[#ffd9e7] sm:inset-x-5 lg:inset-x-14 lg:rounded-[26px]" />

  <div className="container relative z-10">
    <div
      className="
        grid min-h-[500px] grid-cols-1 items-center
        gap-2 px-5 pt-8
        sm:px-8 sm:pt-10
        lg:min-h-[535px]
        lg:grid-cols-[1.02fr_0.98fr]
        lg:px-14 lg:pt-7
      "
    >
      {/* ================================================= */}
      {/* LEFT CONTENT */}
      {/* ================================================= */}
      <div className="relative z-20 flex flex-col justify-center pb-8 lg:pb-10">

        {/* Eyebrow */}
        <div className="mb-4">
          <span
            className="
              inline-flex items-center gap-2
              rounded-full
              border border-pink-200
              bg-white/75
              px-3 py-1.5
              text-[9px] font-extrabold uppercase
              tracking-[0.5px]
              text-[#ed2165]
              shadow-sm
              backdrop-blur-sm
              sm:px-4 sm:py-2 sm:text-[10px]
            "
          >
            <span className="text-xs">✦</span>

            {hero.eyebrow || "100% Virgin Human Hair"}

            <span className="text-pink-300">→</span>
          </span>
        </div>

        {/* Heading */}
        <h1
          className="
            max-w-[650px]
            font-serif
            text-[39px]
            font-bold
            leading-[1.02]
            tracking-[-1.5px]
            text-[#17141a]
            sm:text-[50px]
            md:text-[58px]
            lg:text-[61px]
            xl:text-[64px]
          "
        >
          {hero.title || "Luxury Hair"}

          <br />

          <span className="text-[#17141a]">
            That{" "}
          </span>

          <span
            className="
              bg-gradient-to-r
              from-[#ed2165]
              via-[#f13f7d]
              to-[#d91a5c]
              bg-clip-text
              text-transparent
            "
          >
            {hero.highlightText || "Defines"}
          </span>

          <span className="text-[#17141a]"> You</span>
        </h1>

        {/* Subtitle */}
        <p
          className="
            mt-4
            max-w-[500px]
            text-[13px]
            leading-6
            text-[#575057]
            sm:text-[15px]
            sm:leading-7
          "
        >
          {hero.subtitle ||
            "Premium quality hair extensions, wigs & more. Look beautiful. Feel confident."}
        </p>

        {/* CTA Buttons */}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to={hero.primaryCtaLink || "/shop"}
            className="
              inline-flex
              min-h-[42px]
              min-w-[112px]
              items-center
              justify-center
              rounded-[7px]
              bg-gradient-to-r
              from-[#ed2165]
              to-[#d9165b]
              px-5
              text-[11px]
              font-bold
              text-white
              shadow-[0_8px_20px_rgba(226,36,103,0.22)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_12px_25px_rgba(226,36,103,0.30)]
            "
          >
            {hero.primaryCtaText || "Shop Now"}
          </Link>

          <Link
            to={hero.secondaryCtaLink || "/about"}
            className="
              inline-flex
              min-h-[42px]
              min-w-[130px]
              items-center
              justify-center
              rounded-[7px]
              border
              border-pink-100
              bg-white
              px-5
              text-[11px]
              font-bold
              text-[#e22667]
              shadow-[0_5px_15px_rgba(70,20,40,0.06)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#fff8fa]
            "
          >
            {hero.secondaryCtaText || "View Collections"}
          </Link>
        </div>

        {/* ================= TRUST POINTS ================= */}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
          {[
            {
              icon: "✓",
              title: "Premium Quality",
              sub: "100% Human Hair",
            },
            {
              icon: "▣",
              title: "Free Shipping",
              sub: "On orders over $199",
            },
            {
              icon: "↻",
              title: "Easy Returns",
              sub: "30 Days Return",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-2"
            >
              <div
                className="
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-full
                  border border-pink-200
                  bg-white
                  text-[#ed2165]
                  shadow-sm
                "
              >
                <span className="text-xs font-black">
                  {item.icon}
                </span>
              </div>

              <div className="flex flex-col">
                <strong className="text-[9px] font-bold text-[#272329] sm:text-[10px]">
                  {item.title}
                </strong>

                <span className="text-[8px] text-[#777078] sm:text-[9px]">
                  {item.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================= */}
      {/* RIGHT IMAGE */}
      {/* ================================================= */}
      <div
        className="
          relative
          flex
          min-h-[390px]
          items-end
          justify-center
          lg:min-h-[535px]
        "
      >
        {/* Pink Circle */}
        <div
          className="
            absolute
            right-1/2
            top-4
            h-[330px]
            w-[330px]
            translate-x-1/2
            rounded-full
            bg-gradient-to-br
            from-[#f8b4ca]
            via-[#f796b7]
            to-[#f36d9d]
            sm:h-[400px]
            sm:w-[400px]
            lg:right-[-20px]
            lg:top-[-5px]
            lg:h-[510px]
            lg:w-[510px]
            lg:translate-x-0
          "
        />

        {/* Decorative flowers / leaves */}
        <div
          className="
            absolute
            bottom-5
            left-0
            z-[1]
            text-[75px]
            opacity-70
            sm:text-[95px]
            lg:bottom-10
            lg:left-[-10px]
            lg:text-[110px]
          "
        >
          🌿
        </div>

        <div
          className="
            absolute
            right-0
            top-8
            z-[1]
            text-[65px]
            opacity-70
            sm:text-[80px]
            lg:right-[-5px]
            lg:text-[95px]
          "
        >
          🌸
        </div>

        {/* Model */}
        <PhotoBlock
          tone="gold"
          ratio="3/4"
          rounded={28}
          label="Featured"
          sub="Double-Drawn Body Wave"
          className="
            relative
            z-10
            h-[385px]
            w-[275px]
            overflow-hidden
            !rounded-t-[145px]
            !rounded-b-[10px]
            bg-transparent
            shadow-none

            sm:h-[450px]
            sm:w-[320px]
            sm:!rounded-t-[170px]

            lg:h-[530px]
            lg:w-[390px]
            lg:!rounded-t-[195px]
            lg:!rounded-b-[14px]
          "
          src={resolveImageUrl(hero.image) || heroModel}
          alt="Luxury hair model"
        />

        {/* Rating Card */}
        <div
          className="
            absolute
            right-0
            top-[205px]
            z-30
            flex
            items-center
            gap-2
            rounded-[10px]
            border
            border-black/5
            bg-white
            px-3
            py-2.5
            shadow-[0_10px_25px_rgba(55,20,35,0.14)]

            sm:right-2
            sm:top-[275px]
            sm:px-4
            sm:py-3

            lg:right-[5px]
            lg:top-[315px]
          "
        >
          {/* Customer avatars */}
          <div className="flex -space-x-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border-2
                  border-white
                  bg-[#f1b19b]
                  text-[9px]
                  font-bold
                  text-white
                  sm:h-8
                  sm:w-8
                "
              >
                👩🏽
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-[#302930] sm:text-[9px]">
              Trusted by 50K+
            </span>

            <span className="text-[8px] text-[#81757c]">
              Happy Customers
            </span>

            <div className="mt-0.5 text-[9px] tracking-[1px] text-[#ffae00]">
              ★★★★★
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


{/* ========================================================= */}
{/* TRUST / FEATURE STRIP */}
{/* ========================================================= */}

<div className="container relative z-20 px-3 pb-5 pt-3 sm:px-5 lg:px-14">
  <div
    className="
      grid
      grid-cols-1
      overflow-hidden
      rounded-[14px]
      border
      border-pink-100
      bg-white
      p-1
      shadow-[0_8px_25px_rgba(55,20,35,0.06)]

      sm:grid-cols-2

      lg:grid-cols-5
    "
  >
    {[
      {
        icon: "♨",
        title: "100% Human Hair",
        sub: "No Synthetic Mix",
      },
      {
        icon: "✂",
        title: "Can Be Dyed",
        sub: "Bleached & Styled",
      },
      {
        icon: "◷",
        title: "Long Lasting",
        sub: "Durable & Soft",
      },
      {
        icon: "◒",
        title: "Healthy Ends",
        sub: "Full & Thick Ends",
      },
      {
        icon: "▣",
        title: "Secure Payment",
        sub: "100% Safe & Secure",
      },
    ].map((item, index) => (
      <div
        key={item.title}
        className={`
          flex
          min-h-[60px]
          items-center
          gap-3
          px-4
          py-2.5

          lg:justify-center
          lg:px-3

          ${
            index !== 4
              ? "border-b border-pink-100 lg:border-b-0 lg:border-r"
              : ""
          }
        `}
      >
        {/* Icon */}
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#fff1f6]
            text-[#e22667]
          "
        >
          <span className="text-base font-bold">
            {item.icon}
          </span>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-0.5">
          <strong className="text-[9px] font-bold text-[#242025] sm:text-[10px]">
            {item.title}
          </strong>

          <span className="text-[8px] text-[#777078] sm:text-[9px]">
            {item.sub}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>

      {/* PROMO STRIP — 3 cards: new customer / bundle deals / refer & earn, using the site's existing .promo-strip / .promo-card styles */}
      <Reveal as="section" className="container">
        <div className="promo-strip">
          <div className="promo-card promo-card--gold">
            <span className="promo-card-tag">{coupon.eyebrow || 'New Customers'}</span>
            <h3>Get {coupon.discountText || '10%'} Off</h3>
            <p>On your first order — use code <strong>{coupon.code || 'BIRGOLD10'}</strong></p>
            <Link to={coupon.ctaLink || '/shop'} className="btn btn-gold btn-sm">Shop Now</Link>
          </div>
          <div className="promo-card promo-card--rose">
            <span className="promo-card-tag">Bundle Deals</span>
            <h3>Save More</h3>
            <p>When you buy more — bigger bundles unlock deeper pricing.</p>
            <Link to="/shop" className="btn btn-outline on-light btn-sm">Shop Bundles</Link>
          </div>
          <div className="promo-card promo-card--beige">
            <span className="promo-card-tag">Refer &amp; Earn</span>
            <h3>Get $20</h3>
            <p>For every friend you refer to B.I.R Hair.</p>
            <Link to="/referrals" className="btn btn-outline on-light btn-sm">Learn More</Link>
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

      {/* SECONDARY TRUST STRIP — worldwide shipping / support / returns / secure checkout */}
      <div className="container" style={{ marginTop: 8 }}>
        <TrustBadges items={[
          { icon: 'globe', title: 'Worldwide Shipping', sub: 'Fast & Reliable Delivery' },
          { icon: 'shield', title: '24/7 Customer Support', sub: "We're Here to Help" },
          { icon: 'refresh', title: '30 Days Easy Returns', sub: 'Hassle Free Returns' },
          { icon: 'lock', title: 'Secure Checkout', sub: 'SSL Encrypted Payment' },
        ]} />
      </div>

      {/* NEW ARRIVALS + FLASH SALE — side-by-side split, matching the reference layout exactly */}
      {(sectionEnabled('newArrivals') || sectionEnabled('flashSale')) && (
        <Reveal as="section" className="section">
          <div className="container hp-split-2-1">
            {sectionEnabled('newArrivals') && (
              <div>
                <div className="section-head row" style={{ marginBottom: 24 }}>
                  <div>
                    <span className="eyebrow">Just Landed</span>
                    <h2 className="section-title">New Arrivals</h2>
                  </div>
                  <Link to="/shop" className="btn btn-outline on-light btn-sm">View All</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                  {newArrivals.slice(0, 4).map((p) => (
                    <ProductCard product={p} key={p.id} onQuickView={setQuickViewProduct} />
                  ))}
                </div>
              </div>
            )}
            {sectionEnabled('flashSale') && dealOfDay && (
              <div className="card" style={{ padding: 24, background: 'var(--espresso)', color: 'var(--cream)' }}>
                <span className="eyebrow" style={{ color: 'var(--champagne)' }}>⚡ Flash Sale</span>
                <p style={{ fontSize: '0.82rem', opacity: 0.65, margin: '4px 0 16px' }}>Limited Time Offer</p>
                <CountdownTimer hours={8} endsAt={dealOfDay.flashSaleEndsAt} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20 }}>
                  <div style={{ width: 84, flexShrink: 0 }}>
                    <PhotoBlock tone="gold" ratio="1/1" rounded={14} src={resolveImageUrl(dealOfDay.image) || dealOfDayImg} alt={dealOfDay.name} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: 6, color: 'var(--cream)' }}>{dealOfDay.name}</h4>
                    <div className="deal-price">
                      <span className="price-strike" style={{ color: 'rgba(255,249,252,0.5)' }}>{rupee(dealOfDay.mrp)}</span>
                      <span className="price-now" style={{ color: 'var(--champagne)' }}>{rupee(dealOfDay.price)}</span>
                    </div>
                  </div>
                </div>
                <Link to={`/product/${dealOfDay.id}`} className="btn btn-gold" style={{ width: '100%', marginTop: 20 }}>Shop Now</Link>
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

      {/* SHOP BY LENGTH — pill row using the site's existing .cat-tag pill style */}
      <Reveal as="section" className="section section--tight-top">
        <div className="container">
          <div className="section-head row">
            <div>
              <span className="eyebrow">Find Your Fit</span>
              <h2 className="section-title">Shop By Length</h2>
            </div>
            <Link to="/shop" className="btn btn-outline on-light btn-sm">View All</Link>
          </div>
          <div className="cat-tags" style={{ justifyContent: 'flex-start' }}>
            {HAIR_LENGTHS.map((len) => (
              <Link to={`/shop?length=${encodeURIComponent(len)}`} key={len} className="cat-tag">{len}</Link>
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
                  <PhotoBlock tone={['espresso', 'brown', 'gold', 'beige', 'cream', 'brown'][i % 6]} ratio="1/1" rounded={16} label={c.name} src={resolveImageUrl(c.image)} alt={c.name} />
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

      {/* WHY CHOOSE US + BEFORE & AFTER — side-by-side, matching the reference layout */}
      <Reveal as="section" className="section why-section">
        <div className="container hp-split-1-1">
          <div className="card" style={{ padding: 30 }}>
            <span className="eyebrow">{why.eyebrow || 'Why B.I.R Hair India Factory'}</span>
            <h2 className="section-title" style={{ fontSize: '1.9rem', marginTop: 6, marginBottom: 18 }}>{why.title || 'Factory-direct, without the compromises'}</h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {whyItems.map((item) => (
                <li key={item.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, lineHeight: 1.5 }}>✓</span>
                  <span><strong style={{ display: 'block', fontSize: '0.92rem' }}>{item.title}</strong><span style={{ fontSize: '0.82rem', color: 'rgba(31,31,31,0.6)' }}>{item.description}</span></span>
                </li>
              ))}
            </ul>
            <Link to="/about" className="btn btn-gold btn-sm">Learn More</Link>
          </div>
          <BeforeAfterCard items={beforeAfter} />
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

      {/* BEFORE / AFTER GRID */}
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
                  <PhotoBlock tone="beige" ratio="16/10" rounded={0} label={b.cat} src={resolveImageUrl(b.img)} alt={b.title} />
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

      {/* FAQ — 4-item preview grid, using the site's .card + brand colors */}
      <Reveal as="section" className="section section--tight-top">
        <div className="container">
          <div className="section-head row">
            <div>
              <span className="eyebrow">{faqTeaser.eyebrow || 'Have Questions?'}</span>
              <h2 className="section-title">{faqTeaser.title || 'Frequently Asked Questions'}</h2>
            </div>
            <Link to="/faq" className="btn btn-outline on-light btn-sm">View All FAQs</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {faqItems.map((f) => (
              <Link to="/faq" className="card" style={{ display: 'block', padding: 22 }} key={f.q}>
                <FiHelpCircle className="text-gold" style={{ fontSize: '1.6rem', marginBottom: 12 }} />
                <h4 style={{ fontSize: '0.95rem', marginBottom: 6 }}>{f.q}</h4>
                <p style={{ fontSize: '0.8rem', color: 'rgba(31,31,31,0.62)' }}>{f.a}</p>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <RecentlyViewed items={recentlyViewed} />

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* NEWSLETTER / VIP LIST */}
      <Reveal as="section" className="newsletter-section">
        <div className="container newsletter-inner">
          <span className="eyebrow" style={{ color: 'var(--champagne)' }}>{newsletterSection.eyebrow || 'Join Our VIP List'}</span>
          <h2 className="section-title" style={{ color: 'var(--cream)' }}>{newsletterSection.title || 'Join the B.I.R Hair Circle'}</h2>
          <p style={{ color: 'rgba(255, 249, 252,0.7)', marginBottom: 18 }}>{newsletterSection.description || 'Get exclusive offers, new arrivals & beauty tips — straight to your inbox.'}</p>
          <NewsletterForm />
          <div className="flex flex-wrap gap-5 justify-center mt-5" style={{ color: 'rgba(255,249,252,0.8)' }}>
            <span className="flex items-center gap-1.5 text-sm"><FiGift /> Exclusive Discounts</span>
            <span className="flex items-center gap-1.5 text-sm"><FiClock /> New Arrivals</span>
            <span className="flex items-center gap-1.5 text-sm"><FiDroplet /> Beauty Tips</span>
            <span className="flex items-center gap-1.5 text-sm"><FiUsers /> Giveaways</span>
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

function BeforeAfterCard({ items }) {
  const [i, setI] = useState(0);
  if (!items.length) return null;
  const b = items[i % items.length];
  return (
    <div>
      <span className="eyebrow">Real Transformations</span>
      <h2 className="section-title" style={{ fontSize: '1.9rem', marginTop: 6, marginBottom: 18 }}>Before &amp; After</h2>
      <div style={{ position: 'relative' }}>
        <div className="ba-split" style={{ borderRadius: 20 }}>
          <PhotoBlock tone="beige" ratio="4/5" rounded={0} label="Before" strands={false} src={b.beforeImage} alt={`${b.title} — before`} />
          <PhotoBlock tone="gold" ratio="4/5" rounded={0} label="After" strands={false} src={b.afterImage} alt={`${b.title} — after`} />
        </div>
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => setI((v) => (v + 1) % items.length)}
            aria-label="Show next transformation"
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: 44, height: 44, borderRadius: '50%', border: 'none',
              background: 'var(--gold-grad-rich)', color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-gold)', cursor: 'pointer',
            }}
          >
            <FiChevronRight />
          </button>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <h4 style={{ fontSize: '0.95rem' }}>{b.title}</h4>
        <span className="ba-tag">{b.tag}</span>
      </div>
    </div>
  );
}