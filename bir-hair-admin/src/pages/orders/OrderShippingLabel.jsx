import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderApi from '../../api/order.api.js';
import { Button } from '../../components/ui/index.js';
import { PageLoader, EmptyState } from '../../components/ui/Feedback.jsx';
import { printHtml } from '../../lib/print.js';

export default function OrderShippingLabel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { orderApi.getOne(id).then(setOrder).catch(() => {}).finally(() => setLoading(false)); }, [id]);

  if (loading) return <PageLoader label="Loading shipping label…" />;
  if (!order) return <EmptyState title="Order not found" />;
  const addr = order.shippingAddress;

  const doPrint = () => printHtml(`Shipping Label #${order.orderNumber || id.slice(-6)}`, `
    <div style="border:2px solid #241b2e;padding:20px;max-width:400px;">
      <p style="font-size:11px;text-transform:uppercase;color:#746c85;margin:0 0 4px;">Ship To</p>
      <p style="font-size:18px;font-weight:700;margin:0 0 6px;">${order.customerName}</p>
      <p style="margin:0;">${addr ? `${addr.line1}<br/>${addr.city}, ${addr.state} ${addr.pincode}` : ''}</p>
      <p style="margin-top:16px;font-size:12px;color:#746c85;">Order #${order.orderNumber || id.slice(-6)}</p>
    </div>
  `);

  return (
    <div>
      <div className="flex justify-between mb-5">
        <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
        <Button onClick={doPrint}>Print Shipping Label</Button>
      </div>
      <div className="bg-white rounded-lg border-2 border-ink shadow-sm p-6 max-w-sm mx-auto">
        <p className="text-[11px] uppercase text-ink-faint mb-1">Ship To</p>
        <p className="text-lg font-bold mb-1.5">{order.customerName}</p>
        <p className="text-[13.5px]">{addr ? <>{addr.line1}<br />{addr.city}, {addr.state} {addr.pincode}</> : '—'}</p>
        <p className="text-[12px] text-ink-faint mt-4">Order #{order.orderNumber || id.slice(-6)}</p>
      </div>
    </div>
  );
}
