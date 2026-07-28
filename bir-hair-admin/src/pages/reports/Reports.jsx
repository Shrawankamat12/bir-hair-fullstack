import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import reportApi from '../../api/report.api.js';
import { PageHeader, Card, Tabs, Button } from '../../components/ui/index.js';
import { PageLoader, EmptyState } from '../../components/ui/Feedback.jsx';
import { printTable } from '../../lib/print.js';
import { exportToCsv } from '../../lib/exportCsv.js';
import { formatCurrency, formatDate } from '../../lib/format.js';

const TABS = [
  { value: 'sales', label: 'Sales' },
  { value: 'orders', label: 'Orders' },
  { value: 'customers', label: 'Customers' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'products', label: 'Products' },
];

const CONFIG = {
  sales: { fetch: reportApi.sales, cols: [['date', 'Date', formatDate], ['revenue', 'Revenue', formatCurrency], ['orders', 'Orders']] },
  orders: { fetch: reportApi.orders, cols: [['orderNumber', 'Order #'], ['customerName', 'Customer'], ['status', 'Status'], ['total', 'Total', formatCurrency]] },
  customers: { fetch: reportApi.customers, cols: [['name', 'Customer'], ['ordersCount', 'Orders'], ['totalSpent', 'Total Spent', formatCurrency]] },
  inventory: { fetch: reportApi.inventory, cols: [['name', 'Product'], ['sku', 'SKU'], ['stock', 'Stock'], ['minStock', 'Min Stock']] },
  products: { fetch: reportApi.products, cols: [['name', 'Product'], ['unitsSold', 'Units Sold'], ['revenue', 'Revenue', formatCurrency]] },
};

export default function Reports() {
  const [tab, setTab] = useState('sales');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    CONFIG[tab].fetch().then((data) => setRows(Array.isArray(data) ? data : data?.items || [])).catch(() => setRows([])).finally(() => setLoading(false));
  }, [tab]);

  const cols = CONFIG[tab].cols;
  const columns = cols.map(([key, label, fmt]) => ({ key, label, render: fmt ? (r) => fmt(r[key]) : undefined }));

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Sales, order, customer, inventory and product performance reports."
        actions={<>
          <Button variant="subtle" size="sm" onClick={() => exportToCsv(`${tab}-report`, columns, rows)}>Export CSV</Button>
          <Button variant="subtle" size="sm" onClick={() => printTable(`${tab[0].toUpperCase()}${tab.slice(1)} Report`, columns, rows)}>Print</Button>
        </>}
      />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'sales' && rows.length > 0 && (
        <Card title="Revenue Trend" className="mb-5">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece7f4" />
              <XAxis dataKey="date" tickFormatter={(v) => formatDate(v, { year: undefined })} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#a83bab" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card padded={false}>
        {loading ? <PageLoader /> : rows.length === 0 ? <div className="p-6"><EmptyState title="No data for this report yet" hint="Connect the backend reporting endpoints to populate this view." /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead><tr className="bg-surface-muted text-left text-[11px] uppercase text-ink-muted">{cols.map(([, label]) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border-soft">
                    {cols.map(([key, label, fmt]) => <td key={label} className="px-4 py-2.5">{fmt ? fmt(r[key]) : r[key] ?? '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
