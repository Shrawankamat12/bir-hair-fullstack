import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import customerApi from '../../api/customer.api.js';
import { PageHeader, Card, Button, Tabs, StatusBadge, Badge, StatGrid } from '../../components/ui/index.js';
import { PageLoader, EmptyState } from '../../components/ui/Feedback.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';

const TABS = [
  { value: 'orders', label: 'Orders' },
  { value: 'wishlist', label: 'Wishlist' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'addresses', label: 'Addresses' },
  { value: 'payments', label: 'Payments' },
];

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    customerApi.getOne(id).then(setCustomer).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader label="Loading customer…" />;
  if (!customer) return <EmptyState title="Customer not found" />;

  const orders = customer.orders || [];
  const wishlist = customer.wishlist || [];
  const reviews = customer.reviews || [];
  const addresses = customer.addresses || [];
  const payments = customer.payments || [];

  return (
    <div>
      <PageHeader
        title={customer.name}
        subtitle={customer.email}
        breadcrumbs={[{ label: 'Customers', to: '/customers' }, { label: customer.name }]}
        actions={<Button variant="secondary" onClick={() => navigate('/customers')}>Back to List</Button>}
      />

      <StatGrid>
        <MiniStat label="Total Orders" value={customer.ordersCount ?? orders.length} />
        <MiniStat label="Total Spent" value={formatCurrency(customer.totalSpent)} />
        <MiniStat label="Wishlist Items" value={wishlist.length} />
        <MiniStat label="Reviews Written" value={reviews.length} />
      </StatGrid>

      <div className="grid grid-cols-3 gap-5 items-start">
        <div className="col-span-3 lg:col-span-2">
          <Card padded={false}>
            <div className="px-5 pt-4"><Tabs tabs={TABS} active={tab} onChange={setTab} /></div>
            <div className="px-5 pb-5">
              {tab === 'orders' && (orders.length ? <SimpleTable rows={orders} cols={[
                ['orderNumber', 'Order #'], ['status', 'Status', (v) => <StatusBadge status={v} />], ['total', 'Total', (v) => formatCurrency(v)], ['createdAt', 'Date', formatDate],
              ]} /> : <EmptyState title="No orders yet" />)}
              {tab === 'wishlist' && (wishlist.length ? <SimpleTable rows={wishlist} cols={[['name', 'Product'], ['price', 'Price', (v) => formatCurrency(v)]]} /> : <EmptyState title="Wishlist is empty" />)}
              {tab === 'reviews' && (reviews.length ? <SimpleTable rows={reviews} cols={[['productName', 'Product'], ['rating', 'Rating', (v) => `${v} ★`], ['comment', 'Comment']]} /> : <EmptyState title="No reviews written" />)}
              {tab === 'addresses' && (addresses.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {addresses.map((a, i) => (
                    <div key={i} className="border border-border-soft rounded-md p-3 text-[13px]">
                      {a.label && <Badge tone="neutral" className="mb-2">{a.label}</Badge>}
                      <p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                      <p className="text-ink-faint">{a.city}, {a.state} {a.pincode}</p>
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No saved addresses" />)}
              {tab === 'payments' && (payments.length ? <SimpleTable rows={payments} cols={[['method', 'Method'], ['amount', 'Amount', (v) => formatCurrency(v)], ['status', 'Status', (v) => <StatusBadge status={v} />], ['createdAt', 'Date', formatDate]]} /> : <EmptyState title="No payment records" />)}
            </div>
          </Card>
        </div>

        <div className="col-span-3 lg:col-span-1 flex flex-col gap-5">
          <Card title="Contact Info">
            <div className="flex flex-col gap-2 text-[13px]">
              <Row k="Email" v={customer.email} />
              <Row k="Phone" v={customer.phone || '—'} />
              <Row k="Joined" v={formatDate(customer.createdAt)} />
              <Row k="Status" v={<StatusBadge status={customer.status || 'active'} />} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SimpleTable({ rows, cols }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead><tr className="bg-surface-muted text-left text-[11px] uppercase text-ink-muted">{cols.map(([, label]) => <th key={label} className="px-3 py-2.5">{label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border-soft">
              {cols.map(([key, label, fmt]) => <td key={label} className="px-3 py-2.5">{fmt ? fmt(r[key]) : r[key] ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Row({ k, v }) { return <div className="flex justify-between border-b border-border-soft pb-2"><span className="text-ink-faint">{k}</span><span className="font-medium">{v}</span></div>; }
function MiniStat({ label, value }) {
  return <div className="bg-surface border border-border-soft rounded-lg p-4 shadow-sm"><p className="text-[12px] text-ink-muted font-medium mb-1">{label}</p><p className="text-xl font-bold text-ink">{value}</p></div>;
}
