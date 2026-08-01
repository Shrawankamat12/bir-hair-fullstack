import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import PhotoBlock from '../components/PhotoBlock';
import ImageZoom from '../components/ImageZoom';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import PageHeader from '../components/PageHeader';
import QuickView from '../components/QuickView';
import TrustBadges from '../components/TrustBadges';
import FrequentlyBoughtTogether from '../components/FrequentlyBoughtTogether';
import RecentlyViewed from '../components/RecentlyViewed';
import { ProductGridSkeleton, LineSkeleton, BlockSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/StateBlocks';
import { rupee } from '../lib/format';
import { useProduct, useProducts, useProductReviews } from '../hooks/useStoreData';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { reviewsApi } from '../lib/resources';
import { useStore } from '../context/StoreContext';
import { useCompare } from '../context/CompareContext';
import './ProductDetail.css';

const DEFAULT_LENGTHS = [14, 18, 22, 26, 30];
const DEFAULT_COLORS = ['Natural Black', '#1B Natural Black', 'Ombre', 'Custom'];
const TABS = ['Description', 'Specifications', 'Shipping', 'Reviews'];

export default function ProductDetail() {
  const { id } = useParams();
  const { product, loading, error, refetch } = useProduct(id);
  const { addToCart, toggleWishlist, isWishlisted, user, showToast, showError } = useStore();
  const { toggleCompare, isComparing } = useCompare();
  const [activeImg, setActiveImg] = useState(0);
  const [selLength, setSelLength] = useState(18);
  const [selColor, setSelColor] = useState(undefined);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('Description');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  // Admin-managed variants (length / colour / texture / weight / density) drive the picker
  // when the product has them; otherwise we fall back to the original static option lists.
  const variants = product?.hasVariants ? (product.variants || []) : [];
  const lengthOptions = useMemo(() => {
    const fromVariants = [...new Set(variants.map((v) => v.length).filter(Boolean))];
    return fromVariants.length ? fromVariants : DEFAULT_LENGTHS;
  }, [variants]);
  const colorOptions = useMemo(() => {
    const fromVariants = [...new Set(variants.map((v) => v.colour).filter(Boolean))];
    return fromVariants.length ? fromVariants : DEFAULT_COLORS;
  }, [variants]);

  const selectedVariant = variants.find(
    (v) => (!v.length || String(v.length) === String(selLength)) && (!v.colour || v.colour === selColor)
  );

  useEffect(() => {
    if (product) {
      setSelLength(lengthOptions[0] ?? product.length ?? 18);
      setSelColor(colorOptions[0] ?? product.color);
      setActiveImg(0);
      setShowVideo(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const { products: sameCategory } = useProducts(product ? { category: product.category, limit: 8 } : {});
  // "Similar Products": overlap on admin-assigned tags, distinct from same-category "Related Products" below.
  const { products: tagMatches } = useProducts(product?.tags?.length ? { tags: product.tags[0], limit: 8 } : {});
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useProductReviews(product?.id);
  const recentlyViewed = useRecentlyViewed(product);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  if (loading) {
    return (
      <div className="section pdp-section">
        <div className="container pdp-grid">
          <BlockSkeleton height={480} />
          <div>
            <LineSkeleton width="60%" height={28} />
            <div style={{ height: 12 }} />
            <LineSkeleton width="40%" />
            <div style={{ height: 20 }} />
            <LineSkeleton width="30%" height={32} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section pdp-section">
        <div className="container">
          <ErrorState message="This product could not be loaded." onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!product) return <Navigate to="/404" replace />;

  const related = sameCategory.filter((p) => p.id !== product.id).slice(0, 4);
  const similar = tagMatches.filter((p) => p.id !== product.id && !related.find((r) => r.id === p.id)).slice(0, 4);

  // Real product gallery first (admin-uploaded), topped up with related-product imagery only
  // if the catalog entry doesn't have enough images of its own yet.
  const ownGallery = product.gallery?.length
    ? product.gallery.map((g) => (typeof g === 'string' ? g : g.url)).filter(Boolean)
    : product.images || [];
  const thumbImages = [...new Set([product.image, ...ownGallery])].filter(Boolean);
  if (thumbImages.length < 2) thumbImages.push(...related.map((p) => p.image).filter(Boolean));
  const galleryImages = [...new Set(thumbImages)].slice(0, 6);

  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const effectiveSku = selectedVariant?.sku || product.sku;

  async function submitReview(e) {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to leave a review', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewsApi.create({ productId: product.id, rating: reviewForm.rating, comment: reviewForm.comment });
      showToast('Thanks! Your review will appear once approved.');
      setReviewForm({ rating: 5, comment: '' });
      refetchReviews();
    } catch (err) {
      showError(err, 'Could not submit your review');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <>
      <PageHeader crumbs={[{ label: 'Shop', to: '/shop' }, { label: product.name }]} title={product.name} lede={`SKU ${effectiveSku} · ${product.hairType || ''} · ${product.texture || ''}`} />

      <div className="section pdp-section">
        <div className="container pdp-grid">
          <div className="pdp-gallery">
            {showVideo && product.video ? (
              <div className="pdp-video-frame">
                <video src={product.video} controls autoPlay className="pdp-video" />
                <button className="pdp-video-close" onClick={() => setShowVideo(false)} aria-label="Back to photos">✕ Photos</button>
              </div>
            ) : (
              <ImageZoom src={galleryImages[activeImg] || product.image} alt={product.name} tone={product.tone} rounded={22} />
            )}
            {(galleryImages.length > 1 || product.video) && (
              <div className="pdp-thumbs">
                {galleryImages.map((img, i) => (
                  <button key={i} className={`pdp-thumb ${!showVideo && activeImg === i ? 'active' : ''}`} onClick={() => { setActiveImg(i); setShowVideo(false); }}>
                    <PhotoBlock tone={['gold', 'brown', 'beige', 'espresso'][i % 4]} ratio="1/1" rounded={12} strands={false} src={img} alt="" />
                  </button>
                ))}
                {product.video && (
                  <button className={`pdp-thumb pdp-thumb-video ${showVideo ? 'active' : ''}`} onClick={() => setShowVideo(true)} aria-label="Play product video">
                    <PhotoBlock tone="espresso" ratio="1/1" rounded={12} strands={false} src={product.image} alt="" />
                    <span className="pdp-thumb-play">▶</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="pdp-info">
            {product.badge && <span className={`badge badge-${product.badge.toLowerCase().replace(/[^a-z]/g, '')}`}>{product.badge}</span>}
            {product.saleBadgeText && <span className="badge badge-discount">{product.saleBadgeText}</span>}
            <h1 className="pdp-title">{product.name}</h1>
            <div className="pdp-rating">
              <StarRating value={product.rating} />
              <span>{product.rating} · {product.reviews} reviews</span>
            </div>
            <div className="pdp-price">
              {product.discountPct > 0 && <span className="price-strike">{rupee(product.mrp)}</span>}
              <span className="price-now" style={{ fontSize: '1.7rem' }}>{rupee(effectivePrice)}</span>
              {product.discountPct > 0 && <span className="badge badge-discount">-{product.discountPct}%</span>}
            </div>
            {product.description && <p className="pdp-desc">{product.description}</p>}

            {product.tags?.length > 0 && (
              <div className="pdp-tags">
                {product.tags.map((t) => <span className="pdp-tag-chip" key={t}>{t}</span>)}
              </div>
            )}

            <div className="pdp-variant">
              <span className="pdp-variant-label">Length</span>
              <div className="facc-chip-row">
                {lengthOptions.map((l) => (
                  <button key={l} className={`facc-chip ${String(selLength) === String(l) ? 'active' : ''}`} onClick={() => setSelLength(l)}>{l}"</button>
                ))}
              </div>
            </div>

            <div className="pdp-variant">
              <span className="pdp-variant-label">Color</span>
              <div className="facc-chip-row">
                {colorOptions.map((c) => (
                  <button key={c} className={`facc-chip ${selColor === c ? 'active' : ''}`} onClick={() => setSelColor(c)}>{c}</button>
                ))}
              </div>
            </div>

            <div className="pdp-variant">
              <span className="pdp-variant-label">Quantity</span>
              <div className="pdp-qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
            </div>

            <div className="pdp-stock">
              {effectiveStock > 0 ? '✓ In stock — ships within 24 hours from Delhi' : 'Currently out of stock'}
            </div>

            <div className="pdp-actions">
              <button className="btn btn-outline on-light" onClick={() => addToCart({ ...product, price: effectivePrice, sku: effectiveSku, length: selLength, color: selColor }, qty)}>Add to Cart</button>
              <Link to="/checkout" className="btn btn-gold" onClick={() => addToCart({ ...product, price: effectivePrice, sku: effectiveSku, length: selLength, color: selColor }, qty)}>Buy Now</Link>
              <button className={`pdp-wish-btn ${isWishlisted(product.id) ? 'active' : ''}`} onClick={() => toggleWishlist(product)} aria-label="Wishlist">♥</button>
            </div>

            <label className="pdp-compare-toggle">
              <input type="checkbox" checked={isComparing(product.id)} onChange={() => toggleCompare(product)} />
              Add this to my comparison list
            </label>

            <TrustBadges className="pdp-trust-strip" />

            <div className="pdp-delivery card">
              <span className="eyebrow">Delivery Estimate</span>
              <p>Order within the next 4 hours to have it ship today. Standard delivery: 3–6 business days domestic, 6–12 business days international.</p>
            </div>

            <div className="pdp-bulk card">
              <span className="eyebrow">Bulk &amp; Wholesale Pricing</span>
              <p className="pdp-bulk-lede">Buying for your salon or export business? Save more per bundle at higher quantities.</p>
              <div className="pdp-bulk-table">
                <div className="pdp-bulk-row pdp-bulk-head"><span>Quantity</span><span>Discount</span><span>Price / Bundle</span></div>
                {[
                  { qty: '1–2 bundles', off: '—', price: effectivePrice },
                  { qty: '3–5 bundles', off: '5% off', price: Math.round(effectivePrice * 0.95) },
                  { qty: '6–10 bundles', off: '10% off', price: Math.round(effectivePrice * 0.9) },
                  { qty: '11+ bundles', off: '15% off', price: Math.round(effectivePrice * 0.85) },
                ].map((row) => (
                  <div className="pdp-bulk-row" key={row.qty}><span>{row.qty}</span><span className="pdp-bulk-off">{row.off}</span><span>{rupee(row.price)}</span></div>
                ))}
              </div>
              <Link to="/wholesale" className="btn btn-outline on-light btn-sm" style={{ marginTop: 14 }}>Get a Wholesale Quote</Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="container" style={{ marginBottom: 60 }}>
            <FrequentlyBoughtTogether product={product} pool={related} />
          </div>
        )}

        <div className="container pdp-tabs-wrap">
          <div className="pdp-tabs">
            {TABS.map((t) => (
              <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="pdp-tab-panel">
            {tab === 'Description' && (
              <p>{product.description || `This piece is sourced through our Delhi factory's standard chain: hand-collected, sorted by our artisans for ${(product.texture || '').toLowerCase()} pattern and root direction, then double-drawn for uniform thickness before wefting. Every batch carries a QC signature before it leaves Kirti Nagar.`}</p>
            )}
            {tab === 'Specifications' && (
              <>
                {product.specifications && <p style={{ marginBottom: 16, whiteSpace: 'pre-line' }}>{product.specifications}</p>}
                <ul className="pdp-spec-list">
                  <li><span>Hair Type</span><span>{product.hairType}</span></li>
                  <li><span>Texture</span><span>{product.texture}</span></li>
                  <li><span>Weight</span><span>{product.weight} per bundle</span></li>
                  <li><span>Available Lengths</span><span>{lengthOptions.join('", ')}"</span></li>
                  <li><span>Origin</span><span>Kirti Nagar, Delhi, India</span></li>
                  <li><span>SKU</span><span>{effectiveSku}</span></li>
                </ul>
                {product.careInstructions && (
                  <>
                    <span className="eyebrow" style={{ display: 'block', marginTop: 20 }}>Care Instructions</span>
                    <p>{product.careInstructions}</p>
                  </>
                )}
              </>
            )}
            {tab === 'Shipping' && (
              <p>{product.shippingInfo || 'Ships from our Delhi warehouse within 24 hours. Domestic orders arrive in 3–6 business days; international orders in 6–12 business days depending on customs processing. Bulk and wholesale orders may ship by air freight with a separate timeline confirmed at checkout.'}</p>
            )}
            {tab === 'Reviews' && (
              <div className="pdp-reviews">
                <div className="pdp-review-summary">
                  <span className="pdp-review-score">{product.rating}</span>
                  <div><StarRating value={product.rating} size={16} /><span>{product.reviews} verified reviews</span></div>
                </div>

                {reviewsLoading ? (
                  <LineSkeleton width="100%" height={60} />
                ) : reviews.length === 0 ? (
                  <p className="pdp-review-quote">No reviews yet — be the first to share how this piece wore for you.</p>
                ) : (
                  <ul className="pdp-review-list">
                    {reviews.map((r) => (
                      <li key={r.id} className="pdp-review-quote">
                        <StarRating value={r.rating} size={13} /> "{r.comment}" — {r.name || 'Verified Buyer'} <span style={{ opacity: 0.6 }}>· {r.date}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <form className="pdp-review-form" onSubmit={submitReview} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
                  <span className="eyebrow">Write a Review</span>
                  <div className="facc-chip-row">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <button type="button" key={n} className={`facc-chip ${reviewForm.rating === n ? 'active' : ''}`} onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}>{n}★</button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Share your experience with this product…"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    rows={3}
                    required
                    style={{ padding: 10, borderRadius: 10, border: '1px solid #ddd', font: 'inherit' }}
                  />
                  <button type="submit" className="btn btn-gold btn-sm" disabled={submittingReview} style={{ alignSelf: 'flex-start' }}>
                    {submittingReview ? 'Submitting…' : user ? 'Submit Review' : 'Sign in to Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="section section--tight-top">
          <div className="container">
            <div className="section-head"><span className="eyebrow">You May Also Like</span><h2 className="section-title">Related Products</h2></div>
            <div className="product-grid pdp-related-grid">
              {related.map((p) => <ProductCard product={p} key={p.id} onQuickView={setQuickViewProduct} />)}
            </div>
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div className="section section--tight-top">
          <div className="container">
            <div className="section-head"><span className="eyebrow">Similar Styles</span><h2 className="section-title">Similar Products</h2></div>
            <div className="product-grid pdp-related-grid">
              {similar.map((p) => <ProductCard product={p} key={p.id} onQuickView={setQuickViewProduct} />)}
            </div>
          </div>
        </div>
      )}

      <RecentlyViewed items={recentlyViewed} />

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
