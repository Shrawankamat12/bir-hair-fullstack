import { useNavigate } from 'react-router-dom';
import orderApi from '../../api/order.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { formatCurrency, formatDate } from '../../lib/format.js';

const STATUSES = [
  'pending',
  'placed',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
];

const statusLabel = (s) =>
  s
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');

export default function OrderList() {
  const navigate = useNavigate();
  const entity = useEntityList(orderApi, { searchKeys: ['orderNumber', 'customerName', 'customerEmail'] });

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      sortable: true,
      render: (r) => (
        <span
          className="font-semibold cursor-pointer hover:text-brand-magenta"
          onClick={() => navigate(`/orders/${r._id || r.id}`)}
        >
          #{r.orderNumber || (r._id || r.id).slice(-6)}
        </span>
      ),
    },
    { key: 'customerName', label: 'Customer', render: (r) => r.customerName || r.shippingAddress?.fullName || 'Guest' },
    { key: 'itemsCount', label: 'Items', render: (r) => r.itemsCount ?? r.items?.length ?? 0 },
    { key: 'grandTotal', label: 'Total', sortable: true, render: (r) => formatCurrency(r.pricing?.grandTotal) },
    { key: 'paymentStatus', label: 'Payment', render: (r) => <StatusBadge status={r.payment?.status || 'pending'} /> },
    { key: 'orderStatus', label: 'Order Status', render: (r) => <StatusBadge status={r.orderStatus || 'pending'} /> },
    { key: 'createdAt', label: 'Date', sortable: true, render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <EntityListPage
      title="Orders"
      subtitle="All customer orders, from placement through delivery."
      entity={entity}
      columns={columns}
      onView={(row) => navigate(`/orders/${row._id || row.id}`)}
      showExport={false}
      filterOptions={[{ key: 'orderStatus', label: 'Status', options: STATUSES.map((s) => ({ value: s, label: statusLabel(s) })) }]}
      statusOptions={STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))}
    />
  );
}