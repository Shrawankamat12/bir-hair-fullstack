import { useState } from 'react';
import contactApi from '../../api/contact.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { Drawer, Textarea, Button, StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';
import { formatDateTime } from '../../lib/format.js';

export default function ContactMessages() {
  const entity = useEntityList(contactApi, { searchKeys: ['name', 'email', 'message'] });
  const toast = useToast();
  const [viewing, setViewing] = useState(null);
  const [reply, setReply] = useState('');

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject' },
    { key: 'message', label: 'Message', render: (r) => <span className="line-clamp-1 max-w-xs block">{r.message}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status || 'new'} /> },
    { key: 'createdAt', label: 'Received', render: (r) => formatDateTime(r.createdAt) },
  ];

  const submitReply = async () => {
    try { await contactApi.update(viewing._id || viewing.id, { status: 'replied', reply }); } catch {}
    await entity.update(viewing._id || viewing.id, { status: 'replied', reply });
    toast.success('Reply sent');
    setViewing(null); setReply('');
  };

  return (
    <div>
      <EntityListPage title="Contact Messages" subtitle="Messages submitted through the storefront contact form." entity={entity} columns={columns}
        onView={(row) => { setViewing(row); setReply(row.reply || ''); }} exportFilename="contact-messages"
        filterOptions={[{ key: 'status', label: 'Status', options: [{ value: 'new', label: 'New' }, { value: 'replied', label: 'Replied' }] }]}
        statusOptions={[{ value: 'replied', label: 'Replied' }]} />

      <Drawer open={!!viewing} onClose={() => setViewing(null)} title={viewing?.subject || 'Message'} footer={<>
        <Button variant="secondary" onClick={() => setViewing(null)}>Close</Button>
        <Button onClick={submitReply}>Send Reply</Button>
      </>}>
        {viewing && (
          <div className="flex flex-col gap-4">
            <div className="text-[13px]"><span className="font-semibold">{viewing.name}</span> · {viewing.email}</div>
            <p className="text-[13.5px] text-ink-muted bg-surface-muted rounded-md p-3">{viewing.message}</p>
            <Textarea rows={5} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply…" />
          </div>
        )}
      </Drawer>
    </div>
  );
}
