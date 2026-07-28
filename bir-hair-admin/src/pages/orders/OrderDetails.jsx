import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import orderApi from '../../api/order.api.js';
import { PageHeader, Card, Button, StatusBadge, Select } from '../../components/ui/index.js';
import { PageLoader, EmptyState, useToast } from '../../components/ui/Feedback.jsx';
import { formatCurrency, formatDateTime } from '../../lib/format.js';

const STATUS_FLOW = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => orderApi.getOne(id).then(setOrder).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const changeStatus = async (status) => {
    try {
      await orderApi.update(id, { status });
      toast.success(`Order marked as ${status}`);
      load();
    } catch {
      toast.error('Could not update order status');
    }
  };

  if (loading) return <PageLoader label="Loading order…" />;
  if (!order) return <EmptyState title="Order not found" />;

  const timeline = order.timeline || STATUS_FLOW.slice(0, STATUS_FLOW.indexOf(order.status || 'placed') + 1).map((s) => ({ status: s, at: order.createdAt }));
  const items = order.items || [];

  return (
    <div>
      <PageHeader
        title={`Order #${order.orderNumber || id.slice(-6)}`}
        breadcrumbs={[{ label: 'Orders', to: '/orders' }, { label: `#${order.orderNumber || id.slice(-6)}` }]}
        actions={<>
          <Button variant="secondary" onClick={() => navigate('/orders')}>Back</Button>
          <Button variant="secondary" onClick={() => navigate(`/orders/${id}/invoice`)}>Invoice</Button>
          <Button variant="secondary" onClick={() => navigate(`/orders/${id}/packing-slip`)}>Packing Slip</Button>
          <Button variant="secondary" onClick={() => navigate(`/orders/${id}/shipping-label`)}>Shipping Label</Button>
        </>}
      />

      <div className="grid grid-cols-3 gap-5 items-start">
        <div className="col-span-3 lg:col-span-2 flex flex-col gap-5">
          <Card title="Items" padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead><tr className="bg-surface-muted text-left text-[11px] uppercase text-ink-muted">
                  <th className="px-3.5 py-2.5">Product</th><th className="px-3.5 py-2.5">SKU</th><th className="px-3.5 py-2.5">Qty</th><th className="px-3.5 py-2.5">Price</th><th className="px-3.5 py-2.5">Subtotal</th>
                </tr></thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} className="border-t border-border-soft">
                      <td className="px-3.5 py-2.5 flex items-center gap-2">{it.image && <img src={it.image} className="h-8 w-8 rounded object-cover" />}{it.name}</td>
                      <td className="px-3.5 py-2.5"><code className="text-xs">{it.sku}</code></td>
                      <td className="px-3.5 py-2.5">{it.qty}</td>
                      <td className="px-3.5 py-2.5">{formatCurrency(it.price)}</td>
                      <td className="px-3.5 py-2.5 font-semibold">{formatCurrency(it.price * it.qty)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-ink-faint">No line items</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end px-4 py-3 border-t border-border-soft">
              <div className="text-right text-[13.5px] w-56">
                <div className="flex justify-between py-1"><span className="text-ink-faint">Subtotal</span><span>{formatCurrency(order.subtotal ?? order.total)}</span></div>
                <div className="flex justify-between py-1"><span className="text-ink-faint">Shipping</span><span>{formatCurrency(order.shippingFee ?? 0)}</span></div>
                <div className="flex justify-between py-1"><span className="text-ink-faint">Discount</span><span>-{formatCurrency(order.discount ?? 0)}</span></div>
                <div className="flex justify-between py-2 border-t border-border-soft mt-1 font-bold text-ink"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
              </div>
            </div>
          </Card>

          <Card title="Order Timeline">
            <div className="flex flex-col gap-4">
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-brand-gradient" />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold text-[13.5px] capitalize">{t.status}</p>
                    <p className="text-[12px] text-ink-faint">{formatDateTime(t.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-3 lg:col-span-1 flex flex-col gap-5">
          <Card title="Status">
            <div className="flex flex-col gap-3">
              <StatusBadge status={order.status || 'placed'} />
              <Select value={order.status || 'placed'} onChange={(e) => changeStatus(e.target.value)}>
                {STATUS_FLOW.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
              </Select>
            </div>
          </Card>
          <Card title="Customer">
            <div className="flex flex-col gap-2 text-[13px]">
              <Row k="Name" v={order.customerName} />
              <Row k="Email" v={order.email} />
              <Row k="Phone" v={order.phone || '—'} />
            </div>
          </Card>
          <Card title="Shipping Address">
            <p className="text-[13px] text-ink-muted leading-relaxed">
              {order.shippingAddress ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}` : '—'}
            </p>
          </Card>
          <Card title="Payment">
            <div className="flex flex-col gap-2 text-[13px]">
              <Row k="Method" v={order.paymentMethod || '—'} />
              <Row k="Status" v={<StatusBadge status={order.paymentStatus || 'pending'} />} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) { return <div className="flex justify-between border-b border-border-soft pb-2"><span className="text-ink-faint">{k}</span><span className="font-medium">{v}</span></div>; }
