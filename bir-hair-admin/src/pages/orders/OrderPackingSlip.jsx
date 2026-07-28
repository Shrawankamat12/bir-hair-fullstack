import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderApi from '../../api/order.api.js';
import { Button } from '../../components/ui/index.js';
import { PageLoader, EmptyState } from '../../components/ui/Feedback.jsx';
import { formatDate } from '../../lib/format.js';
import { printHtml } from '../../lib/print.js';

export default function OrderPackingSlip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { orderApi.getOne(id).then(setOrder).catch(() => {}).finally(() => setLoading(false)); }, [id]);

  if (loading) return <PageLoader label="Loading packing slip…" />;
  if (!order) return <EmptyState title="Order not found" />;
  const items = order.items || [];

  const doPrint = () => {
    const rows = items.map((it) => `<tr><td>${it.name}</td><td>${it.sku || ''}</td><td>${it.qty}</td></tr>`).join('');
    printHtml(`Packing Slip #${order.orderNumber || id.slice(-6)}`, `
      <p>Order #${order.orderNumber || id.slice(-6)} · ${formatDate(order.createdAt)}</p>
      <p>Ship To: ${order.customerName}<br/>${order.shippingAddress ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}` : ''}</p>
      <table><thead><tr><th>Item</th><th>SKU</th><th>Qty</th></tr></thead><tbody>${rows}</tbody></table>
      <p style="margin-top:24px;">No pricing information is shown on this packing slip.</p>
    `);
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
        <p className="text-[13px] mb-4"><span className="text-ink-faint">Ship To: </span>{order.customerName}{order.shippingAddress ? ` — ${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}` : ''}</p>
        <table className="w-full text-[13px]">
          <thead><tr className="bg-surface-muted text-left text-[11px] uppercase text-ink-muted"><th className="px-2 py-2">Item</th><th className="px-2 py-2">SKU</th><th className="px-2 py-2">Qty</th></tr></thead>
          <tbody>{items.map((it, i) => <tr key={i} className="border-t border-border-soft"><td className="px-2 py-2">{it.name}</td><td className="px-2 py-2">{it.sku}</td><td className="px-2 py-2">{it.qty}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
