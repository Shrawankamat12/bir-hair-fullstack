import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiX, FiHeart } from 'react-icons/fi';
import PhotoBlock from './PhotoBlock';
import StarRating from './StarRating';
import { rupee } from '../lib/format';
import { useStore } from '../context/StoreContext';
import { useCompare } from '../context/CompareContext';

export default function QuickView({ product, onClose }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { toggleCompare, isComparing } = useCompare();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  const open = !!product;

  return (
    <>
      <div className={`overlay-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`qv-modal ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Quick view">
        {product && (
          <>
            <button className="qv-close" onClick={onClose} aria-label="Close quick view"><FiX /></button>
            <div className="qv-grid">
              <div className="qv-media">
                <PhotoBlock tone={product.tone} ratio="1/1" rounded={0} src={product.image} alt={product.name} />
                {product.badge && <span className={`badge badge-${product.badge.toLowerCase().replace(/[^a-z]/g, '')}`} style={{ position: 'absolute', top: 16, left: 16 }}>{product.badge}</span>}
              </div>
              <div className="qv-body">
                <span className="qv-variant-label">{product.hairType} · {product.texture}</span>
                <h3 style={{ fontSize: '1.5rem' }}>{product.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'rgba(74,44,42,0.6)' }}>
                  <StarRating value={product.rating} /><span>{product.rating} ({product.reviews} reviews)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {product.discountPct > 0 && <span className="price-strike">{rupee(product.mrp)}</span>}
                  <span className="price-now" style={{ fontSize: '1.5rem' }}>{rupee(product.price)}</span>
                  {product.discountPct > 0 && <span className="badge badge-discount">-{product.discountPct}%</span>}
                </div>
                {product.description && <p style={{ color: 'rgba(74,44,42,0.68)', lineHeight: 1.6, fontSize: '0.92rem' }}>{product.description.slice(0, 180)}{product.description.length > 180 ? '…' : ''}</p>}

                <div className="pdp-qty" style={{ alignSelf: 'flex-start' }}>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)}>+</button>
                </div>

                <div className="qv-actions">
                  <button className="btn btn-gold" onClick={() => { addToCart(product, qty); onClose(); }}>Add to Cart</button>
                  <button className={`pdp-wish-btn ${isWishlisted(product.id) ? 'active' : ''}`} onClick={() => toggleWishlist(product)} aria-label="Wishlist"><FiHeart /></button>
                  <Link to={`/product/${product.id}`} className="btn btn-outline on-light" onClick={onClose}>Full Details</Link>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--stone)', marginTop: 4 }}>
                  <input type="checkbox" checked={isComparing(product.id)} onChange={() => toggleCompare(product)} style={{ accentColor: 'var(--gold)', width: 15, height: 15 }} />
                  Add to compare
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
