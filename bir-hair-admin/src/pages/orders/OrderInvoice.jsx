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

  const doPrint = () => {
    const rows = items.map((it) => `<tr><td>${it.name}</td><td>${it.sku || ''}</td><td>${it.qty}</td><td>${formatCurrency(it.price)}</td><td>${formatCurrency(it.price * it.qty)}</td></tr>`).join('');
    printHtml(`Invoice #${order.orderNumber || id.slice(-6)}`, `
      <p><strong>B.I.R Hair Factory India</strong><br/>Order #${order.orderNumber || id.slice(-6)} · ${formatDate(order.createdAt)}</p>
      <p>Bill To: ${order.customerName}<br/>${order.email}</p>
      <table><thead><tr><th>Item</th><th>SKU</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
      <p style="text-align:right;margin-top:16px;font-size:16px;"><strong>Total: ${formatCurrency(order.total)}</strong></p>
    `);
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
          <div className="text-right text-[13px]"><p className="font-semibold">Order #{order.orderNumber || id.slice(-6)}</p><p className="text-ink-faint">{formatDate(order.createdAt)}</p></div>
        </div>
        <p className="text-[13px] mb-4"><span className="text-ink-faint">Bill To: </span>{order.customerName} · {order.email}</p>
        <table className="w-full text-[13px] mb-4">
          <thead><tr className="bg-surface-muted text-left text-[11px] uppercase text-ink-muted"><th className="px-2 py-2">Item</th><th className="px-2 py-2">SKU</th><th className="px-2 py-2">Qty</th><th className="px-2 py-2">Price</th><th className="px-2 py-2">Subtotal</th></tr></thead>
          <tbody>{items.map((it, i) => <tr key={i} className="border-t border-border-soft"><td className="px-2 py-2">{it.name}</td><td className="px-2 py-2">{it.sku}</td><td className="px-2 py-2">{it.qty}</td><td className="px-2 py-2">{formatCurrency(it.price)}</td><td className="px-2 py-2">{formatCurrency(it.price * it.qty)}</td></tr>)}</tbody>
        </table>
        <div className="text-right font-bold text-lg">Total: {formatCurrency(order.total)}</div>
      </div>
    </div>
  );
}
