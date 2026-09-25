import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiPackage, FiCheck, FiMapPin, FiCreditCard, FiTruck } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { LineSkeleton } from '../components/Skeletons';
import { EmptyState, ErrorState } from '../components/StateBlocks';
import { useStore } from '../context/StoreContext';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import { ordersApi } from '../lib/resources';

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
const STEP_LABELS = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-blue-50 text-blue-600',
  packed: 'bg-violet-50 text-violet-600',
  shipped: 'bg-indigo-50 text-indigo-600',
  out_for_delivery: 'bg-indigo-50 text-indigo-600',
  delivered: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-500',
  returned: 'bg-gray-100 text-gray-500',
  refunded: 'bg-gray-100 text-gray-500',
};

function StatusPill({ status }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-500'
      }`}
    >
      {(status || 'pending').replace(/_/g, ' ')}
    </span>
  );
}

function formatAddress(addr) {
  if (!addr) return '';
  return [addr.line1, addr.line2, addr.landmark, addr.city, addr.state, addr.pincode, addr.country]
    .filter(Boolean)
    .join(', ');
}

export default function OrderDetail() {
  const { id } = useParams();
  const { user, authChecked } = useStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    setNotFound(false);
    ordersApi
      .get(id)
      .then((res) => setOrder(res.data))
      .catch((err) => {
        if (err?.status === 404) setNotFound(true);
        else setError(err);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!authChecked || loading) {
    return (
      <>
        <PageHeader crumbs={[{ label: 'My Account', to: '/account' }, { label: 'Order' }]} title="Order Details" />
        <div className="section">
          <div className="container">
            <LineSkeleton width="100%" height={220} />
          </div>
        </div>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <PageHeader crumbs={[{ label: 'My Account', to: '/account' }, { label: 'Order' }]} title="Order Details" />
        <div className="section">
          <div className="container">
            <EmptyState
              title="Order not found"
              message="We couldn't find this order, or it doesn't belong to your account."
              action={<Link to="/account" className="btn btn-gold">Back to My Orders</Link>}
            />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader crumbs={[{ label: 'My Account', to: '/account' }, { label: 'Order' }]} title="Order Details" />
        <div className="section">
          <div className="container">
            <ErrorState message="Could not load this order." onRetry={load} />
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader crumbs={[{ label: 'My Account', to: '/account' }, { label: 'Order' }]} title="Order Details" />
        <div className="section">
          <div className="container">
            <EmptyState
              title="Please sign in"
              message="Sign in to view your order details."
              action={<Link to="/login" state={{ from: `/account/orders/${id}` }} className="btn btn-gold">Sign In</Link>}
            />
          </div>
        </div>
      </>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(order.orderStatus);
  const isTerminalNegative = ['cancelled', 'returned', 'refunded'].includes(order.orderStatus);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'My Account', to: '/account' }, { label: order.orderNumber }]}
        title={`Order ${order.orderNumber}`}
        lede={`Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
      />

      <div className="section">
        <div className="container" style={{ maxWidth: 880 }}>
          {/* Status header */}
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(226,36,103,0.3)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
              <div>
                <p className="text-sm font-bold text-gray-900">Order Status</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {rupee(order.pricing?.grandTotal ?? 0)} · {order.items?.length || 0} item(s)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={order.orderStatus} />
                <span className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${order.payment?.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {order.payment?.status === 'paid' ? 'Paid' : (order.payment?.status || 'pending')}
                </span>
              </div>
            </div>

            {!isTerminalNegative ? (
              <div className="mt-6 flex items-center justify-between overflow-x-auto">
                {STEP_LABELS.map((s, i) => {
                  const done = i <= currentIdx;
                  const isLast = i === STEP_LABELS.length - 1;
                  return (
                    <div key={s} className="flex flex-1 items-center" style={{ minWidth: 60 }}>
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                            done ? 'bg-gradient-to-br from-[#f58bb1] to-[#e22467] text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {done ? <FiCheck size={14} /> : i + 1}
                        </span>
                        <span className={`text-[11px] font-medium ${done ? 'text-[#ef6c9d]' : 'text-gray-400'}`}>{s}</span>
                      </div>
                      {!isLast && <div className={`mx-2 h-[2px] flex-1 rounded ${done ? 'bg-[#ef6c9d]' : 'bg-gray-200'}`} />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                This order was <strong className="capitalize">{order.orderStatus}</strong>
                {order.cancellation?.reason ? ` — ${order.cancellation.reason}` : '.'}
              </p>
            )}

            {order.shipping?.trackingNumber && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#fff5f8] px-4 py-3 text-sm text-gray-700">
                <FiTruck className="shrink-0 text-[#ef6c9d]" />
                <span>
                  {order.shipping.courierPartner || 'Courier'} · AWB/Tracking:{' '}
                  <strong>{order.shipping.trackingNumber}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(226,36,103,0.3)]">
            <p className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <FiPackage /> Items
            </p>
            <div className="flex flex-col gap-4">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#fff5f8]">
                    {item.image ? (
                      <img src={resolveImageUrl(item.image)} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#ef6c9d]">
                        <FiPackage size={18} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{item.productName}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {[item.variant?.length, item.variant?.colour, item.variant?.texture].filter(Boolean).join(' · ')}
                      {item.variant?.length || item.variant?.colour || item.variant?.texture ? ' · ' : ''}
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-gray-900">{rupee(item.total)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Address */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(226,36,103,0.3)]">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                <FiMapPin /> Delivery Address
              </p>
              <p className="text-sm text-gray-700">{order.shippingAddress?.fullName}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{formatAddress(order.shippingAddress)}</p>
              <p className="mt-1 text-xs text-gray-500">{order.shippingAddress?.phone}</p>
            </div>

            {/* Payment summary */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(226,36,103,0.3)]">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                <FiCreditCard /> Payment Summary
              </p>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>{rupee(order.pricing?.subtotal)}</span>
                </div>
                {order.pricing?.productDiscount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Product Discount</span><span>-{rupee(order.pricing.productDiscount)}</span>
                  </div>
                )}
                {order.pricing?.couponDiscount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Coupon {order.pricing.couponCode ? `(${order.pricing.couponCode})` : ''}</span>
                    <span>-{rupee(order.pricing.couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{order.pricing?.shippingCharge ? rupee(order.pricing.shippingCharge) : 'Free'}</span>
                </div>
                {order.pricing?.tax > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Tax</span><span>{rupee(order.pricing.tax)}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-between border-t border-black/5 pt-2 text-sm font-bold text-gray-900">
                  <span>Total</span><span>{rupee(order.pricing?.grandTotal)}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Payment method: <span className="font-medium capitalize">{order.payment?.method === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link to="/account" className="btn btn-outline on-light">Back to My Orders</Link>
          </div>
        </div>
      </div>
    </>
  );
}