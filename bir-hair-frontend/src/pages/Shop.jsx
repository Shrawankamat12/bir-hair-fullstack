import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import ProductCard from '../components/ProductCard';
import FilterAccordion from '../components/FilterAccordion';
import QuickView from '../components/QuickView';
import RecentlyViewed from '../components/RecentlyViewed';
import { ProductGridSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/StateBlocks';
import { useProducts } from '../hooks/useStoreData';
import { useRecentlyViewedList } from '../hooks/useRecentlyViewed';
import './Shop.css';

const CATS = [
  { id: 'extensions', label: 'Extensions' },
  { id: 'wigs', label: 'Wigs' },
  { id: 'closures', label: 'Closures' },
  { id: 'raw-bundles', label: 'Bulk / Raw' },
];
const HAIR_TYPES = ['Virgin', 'Remy', 'Raw'];
const TEXTURES = ['Straight', 'Body Wave', 'Deep Curly', 'Kinky Curly', 'Wavy', 'Raw Wavy', 'Silky Straight', 'Curly'];
const LENGTHS = [
  { id: 's', label: '8–14"', test: (l) => l >= 8 && l <= 14 },
  { id: 'm', label: '16–20"', test: (l) => l >= 16 && l <= 20 },
  { id: 'l', label: '22–28"', test: (l) => l >= 22 && l <= 28 },
  { id: 'xl', label: '30"+', test: (l) => l >= 30 },
];
const COLORS = ['Natural Black', 'Ombre', 'Blonde', 'Custom'];

export default function Shop() {
  const { products, loading, error, refetch } = useProducts({ limit: 100 });
  const recentlyViewed = useRecentlyViewedList();

  const [cat, setCat] = useState(null);
  const [hairType, setHairType] = useState(null);
  const [texture, setTexture] = useState(null);
  const [length, setLength] = useState(null);
  const [color, setColor] = useState(null);
  const [rating, setRating] = useState(null);
  const [maxPrice, setMaxPrice] = useState(35000);
  const [sort, setSort] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function reset() {
    setCat(null); setHairType(null); setTexture(null); setLength(null);
    setColor(null); setRating(null); setMaxPrice(35000); setSort('featured');
  }

  const activeFilterCount = [cat, hairType, texture, length, color, rating].filter(Boolean).length
    + (maxPrice < 35000 ? 1 : 0);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (hairType && p.hairType !== hairType) return false;
      if (texture && p.texture !== texture) return false;
      if (length && !LENGTHS.find((l) => l.id === length).test(p.length)) return false;
      if (color === 'Blonde' && p.category !== 'blonde') return false;
      if (color === 'Ombre' && p.color !== 'Ombre') return false;
      if (color === 'Natural Black' && !(p.color || '').includes('Natural') && !(p.color || '').includes('#1B')) return false;
      if (rating && p.rating < rating) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'newest') list = [...list].sort((a, b) => (b.badge === 'New') - (a.badge === 'New'));
    return list;
  }, [products, cat, hairType, texture, length, color, rating, maxPrice, sort]);

  const filterPanel = (
    <>
      <div className="shop-filters-head">
        <h3>Filters</h3>
        {activeFilterCount > 0 && <button className="shop-reset" onClick={reset}>Reset ({activeFilterCount})</button>}
      </div>

      <FilterAccordion title="Price Range">
        <input
          type="range" min="4000" max="35000" step="500" value={maxPrice} className="facc-range"
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
        <div className="facc-range-labels"><span>₹4,000</span><span>Up to ₹{maxPrice.toLocaleString('en-IN')}</span></div>
      </FilterAccordion>

      <FilterAccordion title="Category">
        <div className="facc-chip-row">
          {CATS.map((c) => (
            <button key={c.id} className={`facc-chip ${cat === c.id ? 'active' : ''}`} onClick={() => setCat(cat === c.id ? null : c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Hair Type">
        <div className="facc-chip-row">
          {HAIR_TYPES.map((h) => (
            <button key={h} className={`facc-chip ${hairType === h ? 'active' : ''}`} onClick={() => setHairType(hairType === h ? null : h)}>{h}</button>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Texture">
        <div className="facc-chip-row">
          {TEXTURES.map((t) => (
            <button key={t} className={`facc-chip ${texture === t ? 'active' : ''}`} onClick={() => setTexture(texture === t ? null : t)}>{t}</button>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Length" defaultOpen={false}>
        <div className="facc-chip-row">
          {LENGTHS.map((l) => (
            <button key={l.id} className={`facc-chip ${length === l.id ? 'active' : ''}`} onClick={() => setLength(length === l.id ? null : l.id)}>{l.label}</button>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Color" defaultOpen={false}>
        <div className="facc-chip-row">
          {COLORS.map((c) => (
            <button key={c} className={`facc-chip ${color === c ? 'active' : ''}`} onClick={() => setColor(color === c ? null : c)}>{c}</button>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Rating" defaultOpen={false}>
        {[4, 4.5].map((r) => (
          <label className="facc-check" key={r}>
            <input type="checkbox" checked={rating === r} onChange={() => setRating(rating === r ? null : r)} />
            {r}★ &amp; above
          </label>
        ))}
      </FilterAccordion>
    </>
  );

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Shop' }]}
        title="The Complete Collection"
        lede="Virgin, remy &amp; raw hair, hand-inspected at our Delhi factory."
      />

      <div className="sticky-toolbar shop-toolbar-sticky">
        <div className="container shop-toolbar">
          <button className="shop-filter-toggle" onClick={() => setFiltersOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round"/></svg>
            Filters {activeFilterCount > 0 && <span className="shop-filter-count">{activeFilterCount}</span>}
          </button>
          <span className="shop-count-label">{loading ? 'Loading…' : `Showing ${filtered.length} of ${products.length}`}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="section shop-section">
        <div className="container shop-layout">
          <aside className="shop-filters glass">
            {filterPanel}
          </aside>

          <div className="shop-main">
            {loading ? (
              <ProductGridSkeleton count={9} />
            ) : error ? (
              <ErrorState message="Could not load products right now." onRetry={refetch} />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No pieces match those filters yet."
                message="Try widening your price range or clearing a filter — our full collection has 100+ factory-direct pieces."
                action={<button className="btn btn-outline on-light" onClick={reset}>Clear Filters</button>}
              />
            ) : (
              <div className="shop-grid">
                {filtered.map((p, i) => (
                  <ProductCard product={p} key={p.id} style={{ animationDelay: `${(i % 3) * 80}ms` }} onQuickView={setQuickViewProduct} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <RecentlyViewed items={recentlyViewed} />

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      <div className={`overlay-backdrop ${filtersOpen ? 'open' : ''}`} onClick={() => setFiltersOpen(false)} />
      <aside className={`shop-filters-drawer ${filtersOpen ? 'open' : ''}`}>
        <div className="shop-filters-drawer-top">
          <h3>Filters</h3>
          <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">✕</button>
        </div>
        <div className="shop-filters-drawer-body">{filterPanel}</div>
        <div className="shop-filters-drawer-foot">
          <button className="btn btn-gold" style={{ width: '100%' }} onClick={() => setFiltersOpen(false)}>
            Show {filtered.length} Results
          </button>
        </div>
      </aside>
    </>
  );
}
