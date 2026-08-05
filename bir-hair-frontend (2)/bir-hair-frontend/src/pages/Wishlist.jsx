import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function Wishlist() {
  const { wishlist, addToCart } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <>
      <PageHeader crumbs={[{ label: 'Wishlist' }]} title="Your Wishlist" lede={`${wishlist.length} saved piece${wishlist.length !== 1 ? 's' : ''}.`} />
      <div className="section">
        <div className="container">
          {wishlist.length === 0 ? (
            <div className="shop-empty">
              <div className="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.2 2 4.5 5.6 4A5.4 5.4 0 0 1 12 7a5.4 5.4 0 0 1 6.4-3c3.6.5 5.2 4.2 3.6 7.7C19.5 16.4 12 21 12 21Z" /></svg>
              </div>
              <h3>Your wishlist is empty</h3>
              <p>Tap the heart on any product to keep it here for later.</p>
              <Link to="/shop" className="btn btn-gold">Browse the Shop</Link>
            </div>
          ) : (
            <div className="shop-grid">
              {wishlist.map((p) => (
                <div key={p.id}>
                  <ProductCard product={p} onQuickView={setQuickViewProduct} />
                  <button className="btn btn-outline on-light btn-sm" style={{ width: '100%', marginTop: 10 }} onClick={() => addToCart(p)}>
                    Move to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
