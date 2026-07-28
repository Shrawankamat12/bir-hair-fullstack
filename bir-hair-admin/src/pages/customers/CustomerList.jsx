import { useNavigate } from 'react-router-dom';
import customerApi from '../../api/customer.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { formatCurrency, formatDate } from '../../lib/format.js';

export default function CustomerList() {
  const navigate = useNavigate();
  const entity = useEntityList(customerApi, { searchKeys: ['name', 'email', 'phone'] });

  const columns = [
    { key: 'name', label: 'Customer', sortable: true, render: (r) => <span className="font-semibold cursor-pointer hover:text-brand-magenta" onClick={() => navigate(`/customers/${r._id || r.id}`)}>{r.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'ordersCount', label: 'Orders', sortable: true, render: (r) => r.ordersCount ?? 0 },
    { key: 'totalSpent', label: 'Total Spent', sortable: true, render: (r) => formatCurrency(r.totalSpent) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status || 'active'} /> },
    { key: 'createdAt', label: 'Joined', render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <EntityListPage
      title="Customers"
      subtitle="Every registered storefront customer, their orders and lifetime value."
      entity={entity}
      columns={columns}
      onView={(row) => navigate(`/customers/${row._id || row.id}`)}
      exportFilename="customers"
      filterOptions={[{ key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'banned', label: 'Banned' }] }]}
      statusOptions={[{ value: 'active', label: 'Active' }, { value: 'banned', label: 'Banned' }]}
    />
  );
}
