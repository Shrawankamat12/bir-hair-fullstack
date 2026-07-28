import newsletterApi from '../../api/newsletter.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { formatDate } from '../../lib/format.js';

export default function NewsletterList() {
  const entity = useEntityList(newsletterApi, { searchKeys: ['email'] });
  const columns = [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status || 'subscribed'} /> },
    { key: 'source', label: 'Source', render: (r) => r.source || 'Website' },
    { key: 'createdAt', label: 'Subscribed', render: (r) => formatDate(r.createdAt) },
  ];
  return (
    <EntityListPage title="Newsletter Subscribers" subtitle="Everyone subscribed to storefront email updates." entity={entity} columns={columns}
      exportFilename="newsletter-subscribers"
      filterOptions={[{ key: 'status', label: 'Status', options: [{ value: 'subscribed', label: 'Subscribed' }, { value: 'unsubscribed', label: 'Unsubscribed' }] }]} />
  );
}
