import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import { getDashboardSummary } from '../api/dashboard.api.js';
import { PageHeader, Card, StatGrid, StatusBadge, Badge } from '../components/ui/index.js';
import { PageLoader, EmptyState } from '../components/ui/Feedback.jsx';
import { formatCurrency, formatDate } from '../lib/format.js';

const COLORS = ['#e04fb0', '#a83bab', '#5c2179', '#c98a1d', '#2f9e5c', '#d1394c'];

const icon = {
  revenue: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  orders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
  products: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /></svg>,
  customers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
  categories: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>,
  brands: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5" /></svg>,
  warn: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4M12 17h.01" /></svg>,
};

const empty = {
  revenue: 0, ordersCount: 0, productsCount: 0, customersCount: 0, categoriesCount: 0, brandsCount: 0,
  lowStockCount: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0,
  recentOrders: [], recentCustomers: [], bestSellers: [], salesTrend: [], ordersByStatus: [], categoryBreakdown: [],
  notifications: [], activity: [],
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary().then((res) => setData({ ...empty, ...res })).catch(() => setData(empty)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Loading dashboard…" />;
  const d = data || empty;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="A live overview of your store's performance." />

      <StatGrid>
        <Stat label="Revenue" value={formatCurrency(d.revenue)} ic={icon.revenue} />
        <Stat label="Orders" value={d.ordersCount} ic={icon.orders} />
        <Stat label="Products" value={d.productsCount} ic={icon.products} />
        <Stat label="Customers" value={d.customersCount} ic={icon.customers} />
        <Stat label="Categories" value={d.categoriesCount} ic={icon.categories} />
        <Stat label="Brands" value={d.brandsCount} ic={icon.brands} />
        <Stat label="Low Stock" value={d.lowStockCount} ic={icon.warn} tone="warn" />
        <Stat label="Pending Orders" value={d.pendingOrders} tone="warn" />
        <Stat label="Completed Orders" value={d.completedOrders} tone="ok" />
        <Stat label="Cancelled Orders" value={d.cancelledOrders} tone="danger" />
      </StatGrid>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card title="Revenue Analytics — Last 14 Days" className="col-span-3 lg:col-span-2">
          {d.salesTrend?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={d.salesTrend}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e04fb0" stopOpacity={0.35} /><stop offset="100%" stopColor="#e04fb0" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7f4" />
                <XAxis dataKey="date" tickFormatter={(v) => formatDate(v, { year: undefined })} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#a83bab" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No sales data yet" />}
        </Card>

        <Card title="Orders by Category">
          {d.categoryBreakdown?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={d.categoryBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {d.categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No category data yet" />}
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card title="Order Status Breakdown" className="col-span-3 lg:col-span-1">
          {d.ordersByStatus?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7f4" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#a83bab" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No order data yet" />}
        </Card>

        <Card title="Best Selling Products" className="col-span-3 lg:col-span-2" padded={false}>
          {d.bestSellers?.length ? (
            <div className="divide-y divide-border-soft">
              {d.bestSellers.slice(0, 6).map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  {p.image ? <img src={p.image} className="h-9 w-9 rounded object-cover" /> : <div className="h-9 w-9 rounded bg-surface-muted" />}
                  <span className="flex-1 text-[13.5px] font-medium truncate">{p.name}</span>
                  <span className="text-[12.5px] text-ink-faint">{p.unitsSold} sold</span>
                  <span className="font-semibold text-[13.5px]">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          ) : <div className="p-5"><EmptyState title="No sales yet" /></div>}
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card title="Recent Orders" className="col-span-3 lg:col-span-1" padded={false}>
          {d.recentOrders?.length ? (
            <div className="divide-y divide-border-soft">
              {d.recentOrders.slice(0, 6).map((o, i) => (
                <Link key={i} to={`/orders/${o._id || o.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-surface-muted transition-colors">
                  <div><p className="text-[13px] font-semibold">#{o.orderNumber}</p><p className="text-[11.5px] text-ink-faint">{o.customerName}</p></div>
                  <StatusBadge status={o.status} />
                </Link>
              ))}
            </div>
          ) : <div className="p-5"><EmptyState title="No recent orders" /></div>}
        </Card>

        <Card title="Recent Customers" className="col-span-3 lg:col-span-1" padded={false}>
          {d.recentCustomers?.length ? (
            <div className="divide-y divide-border-soft">
              {d.recentCustomers.slice(0, 6).map((c, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div><p className="text-[13px] font-semibold">{c.name}</p><p className="text-[11.5px] text-ink-faint">{c.email}</p></div>
                  <span className="text-[11.5px] text-ink-faint">{formatDate(c.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : <div className="p-5"><EmptyState title="No recent customers" /></div>}
        </Card>

        <Card title="Activity Timeline" className="col-span-3 lg:col-span-1" padded={false}>
          {d.activity?.length ? (
            <div className="flex flex-col gap-0 px-5 py-3">
              {d.activity.slice(0, 6).map((a, i) => (
                <div key={i} className="flex gap-3 pb-3">
                  <div className="h-2 w-2 rounded-full bg-brand-gradient mt-1.5 shrink-0" />
                  <div><p className="text-[12.5px]">{a.message}</p><p className="text-[11px] text-ink-faint">{formatDate(a.at)}</p></div>
                </div>
              ))}
            </div>
          ) : <div className="p-5"><EmptyState title="No recent activity" /></div>}
        </Card>
      </div>

      <Card title="Notifications">
        {d.notifications?.length ? (
          <div className="flex flex-col gap-2.5">
            {d.notifications.slice(0, 5).map((n, i) => (
              <div key={i} className="flex items-center gap-3 text-[13px]">
                <Badge tone={n.type === 'warning' ? 'warning' : 'brand'}>{n.type || 'info'}</Badge>
                <span className="flex-1">{n.message}</span>
                <span className="text-ink-faint text-[11.5px]">{formatDate(n.at)}</span>
              </div>
            ))}
          </div>
        ) : <EmptyState title="You're all caught up" hint="No new notifications." />}
      </Card>
    </div>
  );
}

function Stat({ label, value, ic, tone }) {
  return (
    <div className="bg-surface border border-border-soft rounded-lg shadow-sm p-4 flex items-center gap-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all">
      {ic && <div className="h-10 w-10 rounded-md bg-brand-gradient-soft text-brand-magenta flex items-center justify-center shrink-0"><span className="h-5 w-5 block">{ic}</span></div>}
      <div className="min-w-0">
        <p className="text-[12px] text-ink-muted font-medium mb-0.5">{label}</p>
        <p className={`text-lg font-bold ${tone === 'warn' ? 'text-warning' : tone === 'danger' ? 'text-danger' : tone === 'ok' ? 'text-success' : 'text-ink'}`}>{value}</p>
      </div>
    </div>
  );
}
