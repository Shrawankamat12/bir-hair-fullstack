import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderApi from '../../api/order.api.js';
import { Button } from '../../components/ui/index.js';
import { PageLoader, EmptyState } from '../../components/ui/Feedback.jsx';
import { printHtml } from '../../lib/print.js';

const formatAddress = (a) =>
  a ? [a.line1, a.line2, a.landmark, a.city, a.state, a.country, a.pincode].filter(Boolean).join(', ') : '—';

export default function OrderShippingLabel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { orderApi.getOne(id).then(setOrder).catch(() => {}).finally(() => setLoading(false)); }, [id]);

  if (loading) return <PageLoader label="Loading shipping label…" />;
  if (!order) return <EmptyState title="Order not found" />;

  const addr = order.shippingAddress || {};
  const shipping = order.shipping || {};

  const doPrint = () =>
    printHtml(
      `Shipping Label #${order.orderNumber || id.slice(-6)}`,
      `
      <div style="border:2px solid #241b2e;padding:20px;max-width:400px;">
        <p style="font-size:11px;text-transform:uppercase;color:#746c85;margin:0 0 4px;">Ship To</p>
        <p style="font-size:18px;font-weight:700;margin:0 0 6px;">${addr.fullName || order.customerName || ''}</p>
        ${addr.company ? `<p style="margin:0 0 6px;color:#746c85;">${addr.company}</p>` : ''}
        <p style="margin:0;">${formatAddress(addr)}</p>
        ${addr.phone ? `<p style="margin:8px 0 0;">${addr.phone}</p>` : ''}
        <hr style="margin:16px 0;border:none;border-top:1px solid #ddd;" />
        <p style="margin:0;font-size:12px;color:#746c85;">Order #${order.orderNumber || id.slice(-6)}</p>
        ${shipping.courierPartner ? `<p style="margin:2px 0 0;font-size:12px;color:#746c85;">Courier: ${shipping.courierPartner}</p>` : ''}
        ${shipping.awbNumber ? `<p style="margin:2px 0 0;font-size:13px;font-weight:700;">AWB: ${shipping.awbNumber}</p>` : ''}
      </div>
    `
    );

  return (
    <div>
      <div className="flex justify-between mb-5">
        <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
        <Button onClick={doPrint}>Print Shipping Label</Button>
      </div>
      <div className="bg-white rounded-lg border-2 border-ink shadow-sm p-6 max-w-sm mx-auto">
        <p className="text-[11px] uppercase text-ink-faint mb-1">Ship To</p>
        <p className="text-lg font-bold mb-1">{addr.fullName || order.customerName || '—'}</p>
        {addr.company && <p className="text-[12.5px] text-ink-faint mb-1.5">{addr.company}</p>}
        <p className="text-[13.5px]">{formatAddress(addr)}</p>
        {addr.phone && <p className="text-[13px] mt-2">{addr.phone}</p>}

        <div className="border-t border-border-soft mt-4 pt-3">
          <p className="text-[12px] text-ink-faint">Order #{order.orderNumber || id.slice(-6)}</p>
          {shipping.courierPartner && <p className="text-[12px] text-ink-faint mt-0.5">Courier: {shipping.courierPartner}</p>}
          {shipping.awbNumber && <p className="text-[13px] font-bold mt-0.5">AWB: {shipping.awbNumber}</p>}
        </div>
      </div>
    </div>
  );
}