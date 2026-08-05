import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderApi from '../../api/order.api.js';
import { Button, StatusBadge } from '../../components/ui/index.js';
import { PageLoader, EmptyState, useToast } from '../../components/ui/Feedback.jsx';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/format.js';
import { resolveMediaUrl } from '../../lib/media.js';
import { printHtml } from '../../lib/print.js';

/* Pull from a settings/config API instead of hardcoding, once the brand
   details become editable from the admin panel. */
const COMPANY = {
  name: 'B.I.R Hair Factory India',
  tagline: 'Premium Human Hair Extensions & Wigs',
  gstin: '07AABCB1234C1Z5',
  address: 'Plot 14, Sector 63 Industrial Area, Noida, Uttar Pradesh 201301, India',
  email: 'accounts@birhairfactory.com',
  phone: '+91 98100 22345',
  website: 'www.birhairfactory.com',
};

const STATUS_FLOW = ['pending', 'placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
const EXCEPTION_STATUSES = ['cancelled', 'returned', 'refunded'];

const statusLabel = (s) =>
  (s || '')
    .split('_')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');

const formatAddress = (a) =>
  a ? [a.line1, a.line2, a.landmark, a.city, a.state, a.country, a.pincode].filter(Boolean).join(', ') : '—';

const formatVariant = (v) =>
  v ? [v.length, v.colour, v.texture, v.density, v.weight].filter(Boolean).join(' · ') : '';

export default function OrderInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = () => orderApi.getOne(id).then(setOrder).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  if (loading) return <PageLoader label="Loading invoice…" />;
  if (!order) return <EmptyState title="Order not found" />;

  const items = order.items || [];
  const pricing = order.pricing || {};
  const payment = order.payment || {};
  const shipping = order.shipping || {};
  const billing = order.billingAddress || order.shippingAddress || {};
  const shippingAddr = order.shippingAddress || {};
  const discount = (pricing.productDiscount ?? 0) + (pricing.couponDiscount ?? 0);

  const reached = new Set((order.statusHistory || []).map((h) => h.status));
  if (order.orderStatus) reached.add(order.orderStatus);
  const historyAt = (status) => order.statusHistory?.find((h) => h.status === status)?.at;

  /* ---------------- Actions ---------------- */

  const markAsPaid = async () => {
    setMarking(true);
    try {
      await orderApi.update(id, { paymentStatus: 'paid' });
      toast.success('Order marked as paid');
      load();
    } catch {
      toast.error('Could not update payment status');
    } finally {
      setMarking(false);
    }
  };

  const doShare = async () => {
    const url = window.location.href;
    const title = `Invoice #${order.invoiceNumber || order.orderNumber || id.slice(-6)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — no-op
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Invoice link copied to clipboard');
      } catch {
        toast.error('Could not copy link');
      }
    }
  };

  const doPrint = () => {
    const rows = items
      .map((it) => {
        const variant = formatVariant(it.variant);
        return `<tr><td>${it.productName}${variant ? `<br/><small style="color:#888">${variant}</small>` : ''}</td><td>${it.sku || ''}</td><td>${it.quantity}</td><td>${formatCurrency(it.finalPrice ?? it.unitPrice)}</td><td>${formatCurrency(it.total ?? (it.finalPrice ?? it.unitPrice) * it.quantity)}</td></tr>`;
      })
      .join('');

    printHtml(
      `Invoice #${order.invoiceNumber || order.orderNumber || id.slice(-6)}`,
      `
      <p><strong>${COMPANY.name}</strong><br/>${COMPANY.address}<br/>GSTIN: ${COMPANY.gstin} · ${COMPANY.email} · ${COMPANY.phone}</p>
      <p>Order #${order.orderNumber || id.slice(-6)} · ${formatDate(order.createdAt)}${order.invoiceNumber ? ` · Invoice #${order.invoiceNumber}` : ''}</p>
      <p>Bill To: ${billing.fullName || order.customerName || ''}<br/>${formatAddress(billing)}<br/>${order.customerEmail || ''}${billing.gstNumber ? `<br/>GSTIN: ${billing.gstNumber}` : ''}</p>
      <table><thead><tr><th>Item</th><th>SKU</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
      <p style="text-align:right;margin-top:8px;">Subtotal: ${formatCurrency(pricing.subtotal)}</p>
      <p style="text-align:right;">Shipping: ${formatCurrency(pricing.shippingCharge ?? 0)}</p>
      <p style="text-align:right;">Discount: -${formatCurrency(discount)}</p>
      ${pricing.tax ? `<p style="text-align:right;">Tax: ${formatCurrency(pricing.tax)}</p>` : ''}
      <p style="text-align:right;margin-top:16px;font-size:16px;"><strong>Total: ${formatCurrency(pricing.grandTotal)}</strong></p>
    `
    );
  };

  return (
    <div>
      {/* ---------------- Actions ---------------- */}
      <div className="flex items-center justify-between mb-5">
        <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={doShare}>Share</Button>
          <Button variant="secondary" onClick={doPrint}>Print</Button>
          <Button onClick={markAsPaid} loading={marking} disabled={payment.status === 'paid'}>
            {payment.status === 'paid' ? 'Paid' : 'Mark as Paid'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border-soft shadow-sm max-w-4xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="p-8 border-b border-border-soft">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-ink">{COMPANY.name}</h2>
              <p className="text-[12px] text-ink-faint mb-2">{COMPANY.tagline}</p>
              <div className="text-[12.5px] text-ink-muted leading-relaxed">
                <p>GSTIN: {COMPANY.gstin}</p>
                <p>{COMPANY.address}</p>
                <p>{COMPANY.email} · {COMPANY.phone} · {COMPANY.website}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold">Tax Invoice</p>
              <p className="font-semibold text-ink">{order.invoiceNumber || '—'}</p>
              <p className="text-[12px] text-ink-faint">{order.invoiceDate ? formatDate(order.invoiceDate) : formatDate(order.createdAt)}</p>
              <p className="text-[12.5px] text-ink-muted mt-2">Order #{order.orderNumber || id.slice(-6)}</p>
              <p className="text-[12px] text-ink-faint">{formatDateTime(order.createdAt)}</p>
              <div className="flex gap-2 mt-2 justify-end">
                <StatusBadge status={payment.status || 'pending'} />
                <StatusBadge status={order.orderStatus || 'pending'} />
              </div>
            </div>
          </div>
        </div>

        {/* ================= CUSTOMER / BILLING / SHIPPING ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 border-b border-border-soft">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-2">Customer</p>
            <p className="text-[13px] font-medium text-ink">{order.customerName || '—'}</p>
            <p className="text-[12.5px] text-ink-muted mt-1">{order.isGuest ? 'Guest checkout' : 'Registered customer'}</p>
            <p className="text-[12.5px] text-ink-muted">{order.customerEmail}</p>
            <p className="text-[12.5px] text-ink-muted">{order.customerPhone || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-2">Billing Address</p>
            <p className="text-[13px] font-medium text-ink">{billing.fullName || order.customerName || '—'}</p>
            {billing.company && <p className="text-[12.5px] text-ink-muted">{billing.company}</p>}
            <p className="text-[12.5px] text-ink-muted mt-1">{formatAddress(billing)}</p>
            {billing.gstNumber && <p className="text-[12.5px] text-ink-faint mt-1">GSTIN: {billing.gstNumber}</p>}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-2">Shipping Address</p>
            <p className="text-[13px] font-medium text-ink">{shippingAddr.fullName || order.customerName || '—'}</p>
            {shippingAddr.company && <p className="text-[12.5px] text-ink-muted">{shippingAddr.company}</p>}
            <p className="text-[12.5px] text-ink-muted mt-1">{formatAddress(shippingAddr)}</p>
          </div>
        </div>

        {/* ================= PRODUCTS ================= */}
        <div className="p-8 border-b border-border-soft">
          <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-3">Products</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-surface-muted text-left text-[11px] uppercase text-ink-muted">
                  <th className="px-3 py-2.5">Product</th>
                  <th className="px-3 py-2.5">SKU</th>
                  <th className="px-3 py-2.5">Variant</th>
                  <th className="px-3 py-2.5">Qty</th>
                  <th className="px-3 py-2.5">Unit Price</th>
                  <th className="px-3 py-2.5">Discount</th>
                  <th className="px-3 py-2.5">Final Price</th>
                  <th className="px-3 py-2.5">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t border-border-soft">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {it.image ? (
                          <img src={resolveMediaUrl(it.image)} alt={it.productName} className="h-8 w-8 rounded object-cover border border-border-soft" />
                        ) : (
                          <div className="h-8 w-8 rounded bg-surface-muted" />
                        )}
                        <span className="font-medium">{it.productName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><code className="text-xs">{it.sku}</code></td>
                    <td className="px-3 py-2.5 text-ink-faint text-[12px]">{formatVariant(it.variant) || '—'}</td>
                    <td className="px-3 py-2.5">{it.quantity}</td>
                    <td className="px-3 py-2.5">{formatCurrency(it.unitPrice)}</td>
                    <td className="px-3 py-2.5">{formatCurrency(it.discount || 0)}</td>
                    <td className="px-3 py-2.5">{formatCurrency(it.finalPrice ?? it.unitPrice)}</td>
                    <td className="px-3 py-2.5 font-semibold">{formatCurrency(it.total ?? (it.finalPrice ?? it.unitPrice) * it.quantity)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-6 text-ink-faint">No line items</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="text-right text-[13.5px] w-64">
              <div className="flex justify-between py-1"><span className="text-ink-faint">Subtotal</span><span>{formatCurrency(pricing.subtotal)}</span></div>
              <div className="flex justify-between py-1"><span className="text-ink-faint">Product Discount</span><span>-{formatCurrency(pricing.productDiscount || 0)}</span></div>
              {pricing.couponCode && (
                <div className="flex justify-between py-1">
                  <span className="text-ink-faint">Coupon ({pricing.couponCode})</span>
                  <span>-{formatCurrency(pricing.couponDiscount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between py-1"><span className="text-ink-faint">Shipping</span><span>{formatCurrency(pricing.shippingCharge || 0)}</span></div>
              {pricing.tax > 0 && (
                <div className="flex justify-between py-1"><span className="text-ink-faint">Tax (GST)</span><span>{formatCurrency(pricing.tax)}</span></div>
              )}
              <div className="flex justify-between py-2 border-t border-border-soft mt-1 font-bold text-lg text-ink"><span>Grand Total</span><span>{formatCurrency(pricing.grandTotal)}</span></div>
            </div>
          </div>
        </div>

        {/* ================= PAYMENT / SHIPPING ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 border-b border-border-soft">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-3">Payment Details</p>
            <div className="flex flex-col gap-2 text-[13px]">
              <Row k="Method" v={payment.method ? statusLabel(payment.method) : '—'} />
              <Row k="Transaction ID" v={payment.transactionId || payment.razorpayPaymentId || '—'} />
              <Row k="Status" v={<StatusBadge status={payment.status || 'pending'} />} />
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-3">Shipping Details</p>
            <div className="flex flex-col gap-2 text-[13px]">
              <Row k="Method" v={shipping.method ? statusLabel(shipping.method) : '—'} />
              <Row k="Courier Partner" v={shipping.courierPartner || '—'} />
              <Row k="AWB / Tracking #" v={shipping.awbNumber || shipping.trackingNumber || '—'} />
              <Row k="Shipment ID" v={shipping.shipmentId || '—'} />
              <Row k="Est. Delivery" v={shipping.estimatedDeliveryDate ? formatDate(shipping.estimatedDeliveryDate) : '—'} />
              <Row k="Shipped / Delivered" v={`${shipping.shippedAt ? formatDate(shipping.shippedAt) : '—'} / ${shipping.deliveredAt ? formatDate(shipping.deliveredAt) : '—'}`} />
            </div>
          </div>
        </div>

        {/* ================= TIMELINE ================= */}
        <div className="p-8 border-b border-border-soft">
          <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-4">Order Timeline</p>
          <div className="flex flex-col">
            {STATUS_FLOW.map((step, i) => {
              const done = reached.has(step);
              const isLast = i === STATUS_FLOW.length - 1;
              return (
                <div key={step} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${done ? 'bg-brand-gradient' : 'bg-surface-muted border border-border-soft'}`} />
                    {!isLast && <div className="w-px flex-1 bg-border min-h-[22px]" />}
                  </div>
                  <div className="pb-4">
                    <p className={`font-semibold text-[13.5px] ${done ? 'text-ink' : 'text-ink-faint'}`}>{statusLabel(step)}</p>
                    <p className="text-[12px] text-ink-faint">{done ? formatDateTime(historyAt(step) || order.createdAt) : 'Pending'}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-5 mt-2 pt-4 border-t border-border-soft flex-wrap">
            {EXCEPTION_STATUSES.map((s) => {
              const active = reached.has(s);
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${active ? 'bg-danger' : 'bg-surface-muted border border-border-soft'}`} />
                  <span className={`text-[12px] ${active ? 'text-danger font-semibold' : 'text-ink-faint'}`}>
                    {statusLabel(s)} {active ? `— ${formatDateTime(historyAt(s))}` : '— not applicable'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= NOTES ================= */}
        {(order.customerNote || order.adminNote || order.internalNote) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 border-b border-border-soft">
            {order.customerNote && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-2">Customer Note</p>
                <p className="text-[13px] text-ink-muted leading-relaxed">{order.customerNote}</p>
              </div>
            )}
            {order.adminNote && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-2">Admin Note</p>
                <p className="text-[13px] text-ink-muted leading-relaxed">{order.adminNote}</p>
              </div>
            )}
            {order.internalNote && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-2">
                  Internal Note <span className="normal-case font-normal text-ink-faint">(not visible to customer)</span>
                </p>
                <p className="text-[13px] text-ink-muted leading-relaxed">{order.internalNote}</p>
              </div>
            )}
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div className="p-8">
          <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-2">Terms &amp; Conditions</p>
          <p className="text-[12px] text-ink-muted leading-relaxed mb-4">
            Goods sold under a custom colour-match or cut order are non-returnable. All human-hair products carry a 6-month quality guarantee against shedding or tangling under normal use. Prices are inclusive of GST unless stated otherwise.
          </p>
          <p className="text-[11px] uppercase tracking-wide text-ink-faint font-semibold mb-2">Return Policy</p>
          <p className="text-[12px] text-ink-muted leading-relaxed mb-6">
            Unopened, unused items may be returned within 7 days of delivery for a full refund. Opened extensions and wigs are eligible for exchange only, subject to hygiene inspection.
          </p>
          <p className="text-center text-[13px] text-ink-faint italic">Thank you for your business.</p>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between border-b border-border-soft pb-2">
      <span className="text-ink-faint">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}