import notificationApi from '../../api/notification.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { Badge } from '../../components/ui/index.js';
import { formatDateTime } from '../../lib/format.js';

const TYPE_TONE = { order: 'brand', stock: 'warning', review: 'brand', system: 'neutral', wholesale: 'brand', contact: 'brand' };

export default function NotificationList() {
  const entity = useEntityList(notificationApi, { searchKeys: ['title', 'message', 'type'] });
  const columns = [
    { key: 'type', label: 'Type', render: (r) => <Badge tone={TYPE_TONE[r.type] || 'neutral'}>{r.type || 'system'}</Badge> },
    { key: 'title', label: 'Title' },
    { key: 'message', label: 'Message' },
    { key: 'isRead', label: 'Read', render: (r) => r.isRead ? <Badge tone="neutral">Read</Badge> : <Badge tone="brand">Unread</Badge> },
    { key: 'createdAt', label: 'Received', sortable: true, render: (r) => formatDateTime(r.createdAt) },
  ];
  return (
    <EntityListPage title="Notifications" subtitle="System and order notifications for the admin team." entity={entity} columns={columns}
      exportFilename="notifications"
      filterOptions={[{ key: 'type', label: 'Type', options: Object.keys(TYPE_TONE).map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) })) }]}
    />
  );
}
