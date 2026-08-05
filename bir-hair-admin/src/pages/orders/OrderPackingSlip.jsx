import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderApi from '../../api/order.api.js';
import { Button } from '../../components/ui/index.js';
import { PageLoader, EmptyState } from '../../components/ui/Feedback.jsx';
import { formatDate } from '../../lib/format.js';
import { printHtml } from '../../lib/print.js';

const formatAddress = (a) =>
  a ? [a.line1, a.line2, a.landmark, a.city, a.state, a.country, a.pincode].filter(Boolean).join(', ') : '—';

const formatVariant = (v) =>
  v ? [v.length, v.colour, v.texture, v.density, v.weight].filter(Boolean).join(' · ') : '';

export default function OrderPackingSlip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { orderApi.getOne(id).then(setOrder).catch(() => {}).finally(() => setLoading(false)); }, [id]);

  if (loading) return <PageLoader label="Loading packing slip…" />;
  if (!order) return <EmptyState title="Order not found" />;

  const items = order.items || [];
  const shipping = order.shippingAddress || {};

  const doPrint = () => {
    const rows = items
      .map((it) => {
        const variant = formatVariant(it.variant);
        return `<tr><td>${it.productName}${variant ? `<br/><small style="color:#888">${variant}</small>` : ''}</td><td>${it.sku || ''}</td><td>${it.quantity}</td></tr>`;
      })
      .join('');

    printHtml(
      `Packing Slip #${order.orderNumber || id.slice(-6)}`,
      `
      <p>Order #${order.orderNumber || id.slice(-6)} · ${formatDate(order.createdAt)}</p>
      <p>Ship To: ${shipping.fullName || order.customerName || ''}${shipping.company ? `<br/>${shipping.company}` : ''}<br/>${formatAddress(shipping)}${shipping.phone ? `<br/>${shipping.phone}` : ''}</p>
      <table><thead><tr><th>Item</th><th>SKU</th><th>Qty</th></tr></thead><tbody>${rows}</tbody></table>
      <p style="margin-top:24px;">No pricing information is shown on this packing slip.</p>
    `
    );
  };

  return (
    <div>
      <div className="flex justify-between mb-5">
        <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
        <Button onClick={doPrint}>Print Packing Slip</Button>
      </div>
      <div className="bg-white rounded-lg border border-border-soft shadow-sm p-8 max-w-3xl mx-auto">
        <h2 className="font-heading font-bold text-lg mb-1">Packing Slip</h2>
        <p className="text-[12.5px] text-ink-faint mb-4">Order #{order.orderNumber || id.slice(-6)} · {formatDate(order.createdAt)}</p>

        <div className="mb-5 text-[13px]">
          <span className="text-ink-faint">Ship To: </span>
          <span className="font-medium">{shipping.fullName || order.customerName}</span>
          {shipping.company && <span className="text-ink-muted"> · {shipping.company}</span>}
          <p className="text-ink-muted mt-1">{formatAddress(shipping)}</p>
          {shipping.phone && <p className="text-ink-faint mt-0.5">{shipping.phone}</p>}
        </div>

        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-surface-muted text-left text-[11px] uppercase text-ink-muted">
              <th className="px-2 py-2">Item</th>
              <th className="px-2 py-2">SKU</th>
              <th className="px-2 py-2">Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t border-border-soft">
                <td className="px-2 py-2">
                  <div>{it.productName}</div>
                  {formatVariant(it.variant) && (
                    <div className="text-[11px] text-ink-faint">{formatVariant(it.variant)}</div>
                  )}
                </td>
                <td className="px-2 py-2"><code className="text-xs">{it.sku}</code></td>
                <td className="px-2 py-2">{it.quantity}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={3} className="text-center py-6 text-ink-faint">No line items</td></tr>
            )}
          </tbody>
        </table>

        <p className="text-[12px] text-ink-faint mt-6">No pricing information is shown on this packing slip.</p>
      </div>
    </div>
  );
}