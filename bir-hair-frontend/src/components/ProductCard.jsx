import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiEye } from 'react-icons/fi';
import PhotoBlock from './PhotoBlock';
import StarRating from './StarRating';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { useCompare } from '../context/CompareContext';

export default function ProductCard({ product, style, onQuickView }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { toggleCompare, isComparing } = useCompare();
  const wished = isWishlisted(product.id);
  const comparing = isComparing(product.id);
  const imageUrl = resolveImageUrl(product.image);

  return (
    <motion.div
      className="pcard card reveal"
      style={style}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/product/${product.id}`} className="pcard-media">
        <PhotoBlock tone={product.tone} ratio="4/5" rounded={20} src={imageUrl} alt={product.name} />

        <div className="pcard-badges">
          {product.badge && <span className={`badge badge-${product.badge.toLowerCase().replace(/[^a-z]/g, '')}`}>{product.badge}</span>}
          {product.discountPct > 0 && <span className="badge badge-discount">-{product.discountPct}%</span>}
        </div>

        <button
          className={`pcard-wish ${wished ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          aria-label="Toggle wishlist"
        >
          <FiHeart />
        </button>

        <label className={`pcard-compare ${comparing ? 'checked' : ''}`} onClick={(e) => e.preventDefault()}>
          <input type="checkbox" checked={comparing} onChange={() => toggleCompare(product)} />
          Compare
        </label>

        {onQuickView && (
          <button
            className="pcard-quickview"
            onClick={(e) => { e.preventDefault(); onQuickView(product); }}
          >
            <FiEye /> Quick View
          </button>
        )}
      </Link>

      <div className="pcard-body">
        <span className="pcard-variant">{product.hairType} · {product.length}"</span>
        <Link to={`/product/${product.id}`}><h3 className="pcard-name">{product.name}</h3></Link>
        <div className="pcard-rating">
          <StarRating value={product.rating} />
          <span>{product.rating} ({product.reviews})</span>
        </div>
        <div className="pcard-price-row">
          <div>
            {product.discountPct > 0 && <span className="price-strike">{rupee(product.mrp)}</span>}
            <span className="price-now">{rupee(product.price)}</span>
          </div>
          <button className="btn btn-gold btn-sm" onClick={() => addToCart(product)}>Add</button>
        </div>
      </div>
    </motion.div>
  );
}