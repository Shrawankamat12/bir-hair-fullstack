import wholesaleApi from '../../api/wholesale.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { formatDate } from '../../lib/format.js';

const STATUSES = ['new', 'contacted', 'converted', 'declined'];

export default function WholesaleLeads() {
  const entity = useEntityList(wholesaleApi, { searchKeys: ['companyName', 'name', 'email'] });
  const columns = [
    { key: 'companyName', label: 'Company' },
    { key: 'name', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'quantity', label: 'Est. Quantity' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status || 'new'} /> },
    { key: 'createdAt', label: 'Submitted', render: (r) => formatDate(r.createdAt) },
  ];
  return (
    <EntityListPage title="Wholesale Leads" subtitle="Bulk order inquiries from wholesale buyers." entity={entity} columns={columns}
      exportFilename="wholesale-leads"
      filterOptions={[{ key: 'status', label: 'Status', options: STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })) }]}
      statusOptions={STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))} />
  );
}
