import { useNavigate } from 'react-router-dom';
import orderApi from '../../api/order.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { formatCurrency, formatDate } from '../../lib/format.js';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function OrderList() {
  const navigate = useNavigate();
  const entity = useEntityList(orderApi, { searchKeys: ['orderNumber', 'customerName', 'email'] });

  const columns = [
    { key: 'orderNumber', label: 'Order #', sortable: true, render: (r) => <span className="font-semibold cursor-pointer hover:text-brand-magenta" onClick={() => navigate(`/orders/${r._id || r.id}`)}>#{r.orderNumber || (r._id || r.id).slice(-6)}</span> },
    { key: 'customerName', label: 'Customer' },
    { key: 'itemsCount', label: 'Items', render: (r) => r.items?.length ?? r.itemsCount ?? 0 },
    { key: 'total', label: 'Total', sortable: true, render: (r) => formatCurrency(r.total) },
    { key: 'paymentStatus', label: 'Payment', render: (r) => <StatusBadge status={r.paymentStatus || 'pending'} /> },
    { key: 'status', label: 'Order Status', render: (r) => <StatusBadge status={r.status || 'placed'} /> },
    { key: 'createdAt', label: 'Date', sortable: true, render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <EntityListPage
      title="Orders"
      subtitle="All customer orders, from placement through delivery."
      entity={entity}
      columns={columns}
      onView={(row) => navigate(`/orders/${row._id || row.id}`)}
      exportFilename="orders"
      filterOptions={[{ key: 'status', label: 'Status', options: STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })) }]}
      statusOptions={STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
    />
  );
}
