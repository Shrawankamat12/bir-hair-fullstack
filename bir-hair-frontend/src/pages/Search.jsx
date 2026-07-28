import { useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import { ProductGridSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/StateBlocks';
import { useProducts } from '../hooks/useStoreData';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [localQ, setLocalQ] = useState(q);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { products: results, loading, error, refetch } = useProducts(q ? { search: q, limit: 60 } : {});
  const shown = q ? results : [];

  return (
    <>
      <PageHeader crumbs={[{ label: 'Search' }]} title={q ? `Results for "${q}"` : 'Search'} lede={`${shown.length} product${shown.length !== 1 ? 's' : ''} found.`} />
      <div className="section">
        <div className="container">
          <form className="search-page-form" onSubmit={(e) => { e.preventDefault(); window.location.href = `/search?q=${encodeURIComponent(localQ)}`; }}>
            <div className="search-page-input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
              <input value={localQ} onChange={(e) => setLocalQ(e.target.value)} placeholder="Search bundles, wigs, frontals…" />
              <button type="submit" className="btn btn-gold btn-sm">Search</button>
            </div>
          </form>

          {!q ? (
            <div className="shop-empty">
              <div className="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
              <h3>Find your perfect piece</h3>
              <p>Start typing to search our catalogue of extensions, wigs, closures and raw bundles.</p>
              <Link to="/shop" className="btn btn-gold">Browse Full Shop</Link>
            </div>
          ) : loading ? (
            <ProductGridSkeleton count={6} />
          ) : error ? (
            <ErrorState message="Search is unavailable right now." onRetry={refetch} />
          ) : shown.length === 0 ? (
            <div className="shop-empty">
              <div className="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" strokeLinecap="round" /></svg>
              </div>
              <h3>No results for &ldquo;{q}&rdquo;</h3>
              <p>Try a different texture, hair type or category — or browse the full collection.</p>
              <Link to="/shop" className="btn btn-gold">Browse Full Shop</Link>
            </div>
          ) : (
            <div className="shop-grid">
              {shown.map((p) => <ProductCard product={p} key={p.id} onQuickView={setQuickViewProduct} />)}
            </div>
          )}
        </div>
      </div>
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
