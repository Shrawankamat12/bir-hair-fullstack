import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiEye, FiShoppingCart } from "react-icons/fi";
import PhotoBlock from "./PhotoBlock";
import StarRating from "./StarRating";
import { rupee } from "../lib/format";
import { resolveImageUrl } from "../lib/api";
import { useStore } from "../context/StoreContext";
import { useCompare } from "../context/CompareContext";

export default function ProductCard({ product, style, onQuickView }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { toggleCompare, isComparing } = useCompare();
  const wished = isWishlisted(product.id);
  const comparing = isComparing(product.id);
  const imageUrl = resolveImageUrl(product.image);

  return (
    <motion.div
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={style}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="relative block h-56 overflow-hidden"
      >
        <PhotoBlock
          tone="gold"
          ratio="1/1"
          rounded={0}
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="pcard-badges">
          {product.badge && (
            <span
              className={`badge badge-${product.badge.toLowerCase().replace(/[^a-z]/g, "")}`}
            >
              {product.badge}
            </span>
          )}
          {product.discountPct > 0 && (
            <span className="badge badge-discount">
              -{product.discountPct}%
            </span>
          )}
        </div>

        <button
          className={`pcard-wish ${wished ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label="Toggle wishlist"
        >
          <FiHeart />
        </button>

        <label
          className={`pcard-compare ${comparing ? "checked" : ""}`}
          onClick={(e) => e.preventDefault()}
        >
          <input
            type="checkbox"
            checked={comparing}
            onChange={() => toggleCompare(product)}
          />
          Compare
        </label>

        {onQuickView && (
          <button
            className="pcard-quickview"
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
          >
            <FiEye /> Quick View
          </button>
        )}
      </Link>

      <div className="space-y-2 p-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-pink-600">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            {product.discountPct > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {rupee(product.mrp)}
              </span>
            )}
            <span className="block text-lg font-bold text-pink-600">
              {rupee(product.price)}
            </span>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-600 text-white hover:bg-pink-700 transition"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            aria-label="Add to cart"
          >
            <FiShoppingCart />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <StarRating value={product.rating} />
          <span>({product.reviews})</span>
        </div>
      </div>
    </motion.div>
  );
}
