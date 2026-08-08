import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
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
      <PageHeader
        crumbs={[{ label: 'Wishlist' }]}
        title="Your Wishlist"
        lede={`${wishlist.length} saved piece${wishlist.length !== 1 ? 's' : ''}.`}
      />

      <div className="section" style={{ paddingTop: 20 }}>
        <div className="container mx-auto px-4">
          {wishlist.length === 0 ? (
            /* ===================== EMPTY STATE ===================== */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-black/5 bg-gradient-to-b from-[#fff5f8] to-white px-8 py-16 text-center shadow-[0_20px_50px_-25px_rgba(226,36,103,0.2)]"
            >
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#f8b4ca] to-[#ef6c9d] shadow-[0_10px_30px_rgba(226,36,103,0.3)]">
                <span className="absolute -inset-2 rounded-full border border-[#ef6c9d]/20" />
                <FiHeart size={30} className="text-white" />
              </div>
              <h3 className="mb-2 font-serif text-2xl font-bold text-gray-900">
                Your wishlist is empty
              </h3>
              <p className="mb-7 max-w-xs text-sm leading-relaxed text-gray-500">
                Tap the heart on any product to keep it here for later — build your dream collection.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f58bb1] to-[#e22467] px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(226,36,103,0.32)] transition-transform hover:scale-105"
              >
                Browse the Shop
                <FiArrowRight />
              </Link>
            </motion.div>
          ) : (
            <>
              {/* ===================== GRID ===================== */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence>
                  {wishlist.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                      className="group"
                    >
                      <div className="overflow-hidden rounded-2xl">
                        <ProductCard product={p} onQuickView={setQuickViewProduct} />
                      </div>
                      <button
                        onClick={() => addToCart(p)}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#ef6c9d]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#ef6c9d] shadow-sm transition-all duration-200 hover:border-transparent hover:bg-gradient-to-r hover:from-[#f58bb1] hover:to-[#e22467] hover:text-white hover:shadow-[0_10px_22px_rgba(226,36,103,0.3)]"
                      >
                        <FiShoppingBag size={15} />
                        Move to Cart
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}