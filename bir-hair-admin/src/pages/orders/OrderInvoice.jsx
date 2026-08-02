import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderApi from '../../api/order.api.js';
import { Button } from '../../components/ui/index.js';
import { PageLoader, EmptyState } from '../../components/ui/Feedback.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { printHtml } from '../../lib/print.js';

export default function OrderInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { orderApi.getOne(id).then(setOrder).catch(() => {}).finally(() => setLoading(false)); }, [id]);

  if (loading) return <PageLoader label="Loading invoice…" />;
  if (!order) return <EmptyState title="Order not found" />;

  const items = order.items || [];
  const pricing = order.pricing || {};
  const billing = order.billingAddress || order.shippingAddress || {};
  const discount = (pricing.productDiscount ?? 0) + (pricing.couponDiscount ?? 0);

  const doPrint = () => {
    const rows = items
      .map(
        (it) =>
          `<tr><td>${it.productName}</td><td>${it.sku || ''}</td><td>${it.quantity}</td><td>${formatCurrency(it.finalPrice ?? it.unitPrice)}</td><td>${formatCurrency(it.total ?? (it.finalPrice ?? it.unitPrice) * it.quantity)}</td></tr>`
      )
      .join('');

    printHtml(
      `Invoice #${order.invoiceNumber || order.orderNumber || id.slice(-6)}`,
      `
      <p><strong>B.I.R Hair Factory India</strong><br/>Order #${order.orderNumber || id.slice(-6)} · ${formatDate(order.createdAt)}${order.invoiceNumber ? ` · Invoice #${order.invoiceNumber}` : ''}</p>
      <p>Bill To: ${billing.fullName || order.customerName || ''}<br/>${[billing.line1, billing.line2, billing.city, billing.state, billing.pincode].filter(Boolean).join(', ')}<br/>${order.customerEmail || ''}${billing.gstNumber ? `<br/>GSTIN: ${billing.gstNumber}` : ''}</p>
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
      <div className="flex justify-between mb-5">
        <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
        <Button onClick={doPrint}>Print Invoice</Button>
      </div>
      <div className="bg-white rounded-lg border border-border-soft shadow-sm p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div><h2 className="font-heading font-bold text-lg">B.I.R Hair Factory India</h2><p className="text-[12.5px] text-ink-faint">Tax Invoice</p></div>
          <div className="text-right text-[13px]">
            <p className="font-semibold">Order #{order.orderNumber || id.slice(-6)}</p>
            {order.invoiceNumber && <p className="text-ink-faint">Invoice #{order.invoiceNumber}</p>}
            <p className="text-ink-faint">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="mb-4 text-[13px]">
          <span className="text-ink-faint">Bill To: </span>
          {billing.fullName || order.customerName} · {order.customerEmail}
          {billing.line1 && (
            <p className="text-ink-muted mt-1">
              {[billing.line1, billing.line2, billing.city, billing.state, billing.pincode].filter(Boolean).join(', ')}
            </p>
          )}
          {billing.gstNumber && <p className="text-ink-faint mt-1">GSTIN: {billing.gstNumber}</p>}
        </div>
        <table className="w-full text-[13px] mb-4">
          <thead><tr className="bg-surface-muted text-left text-[11px] uppercase text-ink-muted"><th className="px-2 py-2">Item</th><th className="px-2 py-2">SKU</th><th className="px-2 py-2">Qty</th><th className="px-2 py-2">Price</th><th className="px-2 py-2">Subtotal</th></tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t border-border-soft">
                <td className="px-2 py-2">{it.productName}</td>
                <td className="px-2 py-2">{it.sku}</td>
                <td className="px-2 py-2">{it.quantity}</td>
                <td className="px-2 py-2">{formatCurrency(it.finalPrice ?? it.unitPrice)}</td>
                <td className="px-2 py-2">{formatCurrency(it.total ?? (it.finalPrice ?? it.unitPrice) * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end">
          <div className="text-right text-[13.5px] w-56">
            <div className="flex justify-between py-1"><span className="text-ink-faint">Subtotal</span><span>{formatCurrency(pricing.subtotal)}</span></div>
            <div className="flex justify-between py-1"><span className="text-ink-faint">Shipping</span><span>{formatCurrency(pricing.shippingCharge ?? 0)}</span></div>
            <div className="flex justify-between py-1"><span className="text-ink-faint">Discount</span><span>-{formatCurrency(discount)}</span></div>
            {pricing.tax > 0 && (
              <div className="flex justify-between py-1"><span className="text-ink-faint">Tax</span><span>{formatCurrency(pricing.tax)}</span></div>
            )}
            <div className="flex justify-between py-2 border-t border-border-soft mt-1 font-bold text-lg text-ink"><span>Total</span><span>{formatCurrency(pricing.grandTotal)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}