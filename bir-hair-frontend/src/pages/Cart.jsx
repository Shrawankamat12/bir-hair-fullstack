import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiLock, FiTruck, FiRefreshCw, FiTag, FiArrowLeft } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { useStore } from '../context/StoreContext';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartSubtotal, cartMrpTotal, appliedCoupon, applyCoupon, clearCoupon, showError } = useStore();
  const [coupon, setCoupon] = useState('');
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const discount = cartMrpTotal - cartSubtotal;
  const couponDiscount = appliedCoupon?.discount || 0;
const shipping = cart.length === 0 ? 0 : (cartSubtotal > 15000 ? 0 : 15);
  const total = Math.max(0, cartSubtotal - couponDiscount) + shipping;

  async function handleApply() {
    if (!coupon.trim()) return;
    setApplying(true);
    try {
      await applyCoupon(coupon.trim(), cartSubtotal);
    } catch (err) {
      clearCoupon();
      showError(err, 'Invalid coupon code');
    } finally {
      setApplying(false);
    }
  }

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Cart' }]}
        title="Your Cart"
        lede={`${cart.length} item${cart.length !== 1 ? 's' : ''} selected for checkout.`}
      />

      <div className="section">
        <div className="container mx-auto px-4">
          {cart.length === 0 ? (
            /* ===================== EMPTY STATE ===================== */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-black/5 bg-gradient-to-b from-[#fff5f8] to-white px-8 py-16 text-center shadow-[0_20px_50px_-25px_rgba(226,36,103,0.2)]"
            >
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#f8b4ca] to-[#ef6c9d] shadow-[0_10px_30px_rgba(226,36,103,0.3)]">
                <span className="absolute -inset-2 rounded-full border border-[#ef6c9d]/20" />
                <FiShoppingBag size={28} className="text-white" />
              </div>
              <h3 className="mb-2 font-serif text-2xl font-bold text-gray-900">Your cart is waiting</h3>
              <p className="mb-7 max-w-xs text-sm leading-relaxed text-gray-500">
                Time to add some factory-direct hair to it.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f58bb1] to-[#e22467] px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(226,36,103,0.32)] transition-transform hover:scale-105"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
              {/* ===================== CART ITEMS ===================== */}
              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-[0_8px_24px_-14px_rgba(226,36,103,0.18)] sm:flex-row sm:items-center"
                    >
                      {/* Image */}
                      <Link
                        to={`/product/${item.id}`}
                        className="mx-auto block h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#fff5f8] sm:mx-0"
                      >
                        {item.image ? (
                          <img
                            src={resolveImageUrl(item.image)}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#ef6c9d]">
                            <FiShoppingBag size={26} />
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 text-center sm:text-left">
                        <Link to={`/product/${item.id}`}>
                          <h4 className="mb-1 font-serif text-base font-semibold text-gray-900 transition-colors hover:text-[#ef6c9d]">
                            {item.name}
                          </h4>
                        </Link>
                        <p className="mb-2 text-xs text-gray-500">
                          {item.hairType} · {item.length}&quot; · {item.color}
                        </p>

                        {/* Price sits with the info now, not pinned to the far edge */}
                        <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
                          <span className="text-base font-bold text-gray-900">{rupee(item.price * item.qty)}</span>
                          {item.mrp > item.price && (
                            <span className="text-xs text-gray-400 line-through">{rupee(item.mrp * item.qty)}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-4 sm:justify-start">
                          {/* Qty stepper */}
                          <div className="flex items-center rounded-full border border-gray-200 bg-[#fff8fa]">
                            <button
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              className="flex h-8 w-8 items-center justify-center text-gray-600 transition-colors hover:text-[#ef6c9d]"
                              aria-label="Decrease quantity"
                            >
                              <FiMinus size={13} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-gray-900">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="flex h-8 w-8 items-center justify-center text-gray-600 transition-colors hover:text-[#ef6c9d]"
                              aria-label="Increase quantity"
                            >
                              <FiPlus size={13} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-[#e22467]"
                          >
                            <FiTrash2 size={13} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Link
                  to="/shop"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#ef6c9d] transition-colors hover:text-[#e22467]"
                >
                  <FiArrowLeft size={14} /> Continue Shopping
                </Link>
              </div>

              {/* ===================== ORDER SUMMARY ===================== */}
              <aside className="h-fit rounded-2xl border border-black/5 bg-white p-6 shadow-[0_20px_50px_-25px_rgba(226,36,103,0.25)]">
                <h3 className="mb-4 font-serif text-lg font-bold text-gray-900">Order Summary</h3>

                <div className="mb-4 flex items-center gap-2 rounded-full border border-gray-200 bg-[#fff8fa] px-3 py-2 focus-within:border-[#ef6c9d]">
                  <FiTag className="text-gray-400" size={15} />
                  <input
                    placeholder="Coupon code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                  />
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="shrink-0 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {applying ? 'Checking…' : 'Apply'}
                  </button>
                </div>

                {appliedCoupon && (
                  <p className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                    {appliedCoupon.code} applied — −{rupee(appliedCoupon.discount)}
                    <button
                      onClick={() => { clearCoupon(); setCoupon(''); }}
                      className="ml-auto text-green-700/70 underline hover:text-green-800"
                    >
                      Remove
                    </button>
                  </p>
                )}

                <div className="space-y-2.5 border-t border-black/5 pt-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{rupee(cartSubtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#ef6c9d]">
                      <span>Bundle Savings</span>
                      <span>−{rupee(discount)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-[#ef6c9d]">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>−{rupee(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : rupee(shipping)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                  <span className="font-serif text-base font-bold text-gray-900">Total</span>
                  <span className="font-serif text-xl font-bold text-gray-900">{rupee(total)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="mt-5 w-full rounded-full bg-gradient-to-r from-[#f58bb1] to-[#e22467] py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(226,36,103,0.32)] transition-transform hover:scale-[1.02]"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-black/5 pt-5">
                  {[
                    { icon: FiLock, title: 'Secure', sub: 'SSL encrypted' },
                    { icon: FiTruck, title: '24 Hrs', sub: 'From Delhi' },
                    { icon: FiRefreshCw, title: '7-Day', sub: 'Returns' },
                  ].map(({ icon: Icon, title, sub }) => (
                    <div key={title} className="flex flex-col items-center gap-1 text-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff5f8] text-[#ef6c9d]">
                        <Icon size={14} />
                      </span>
                      <span className="text-[11px] font-semibold text-gray-800">{title}</span>
                      <span className="text-[10px] text-gray-400">{sub}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
}