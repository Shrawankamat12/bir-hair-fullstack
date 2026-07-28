import { useState } from 'react';
import reviewApi from '../../api/review.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { Tabs, Modal, Button, Textarea, Badge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';
import { formatDate } from '../../lib/format.js';

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ReviewList() {
  const [tab, setTab] = useState('pending');
  const entity = useEntityList(reviewApi, { initialFilters: { status: 'pending' }, searchKeys: ['productName', 'customerName', 'comment'] });
  const toast = useToast();
  const [replyRow, setReplyRow] = useState(null);
  const [replyText, setReplyText] = useState('');

  const changeTab = (v) => { setTab(v); entity.setFilters({ status: v }); };
  const counts = TABS.reduce((acc, t) => { acc[t.value] = entity.allRows.filter((r) => r.status === t.value).length; return acc; }, {});

  const columns = [
    { key: 'productName', label: 'Product' },
    { key: 'customerName', label: 'Customer' },
    { key: 'rating', label: 'Rating', render: (r) => '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0)) },
    { key: 'comment', label: 'Comment', render: (r) => <span className="line-clamp-2 max-w-xs block">{r.comment}</span> },
    { key: 'images', label: 'Images', render: (r) => (r.images || []).length ? <div className="flex gap-1">{r.images.slice(0, 3).map((img, i) => <img key={i} src={img} className="h-8 w-8 rounded object-cover" />)}</div> : '—' },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
  ];

  const approve = async (row) => { await entity.update(row._id || row.id, { status: 'approved' }); toast.success('Review approved'); };
  const reject = async (row) => { await entity.update(row._id || row.id, { status: 'rejected' }); toast.success('Review rejected'); };

  const submitReply = async () => {
    try { await reviewApi.reply(replyRow._id || replyRow.id, replyText); } catch {}
    await entity.update(replyRow._id || replyRow.id, { reply: replyText });
    toast.success('Reply posted');
    setReplyRow(null); setReplyText('');
  };

  return (
    <div>
      <Tabs tabs={TABS.map((t) => ({ ...t, count: counts[t.value] }))} active={tab} onChange={changeTab} />
      <EntityListPage
        title="Reviews"
        subtitle="Moderate customer product reviews before they go live."
        entity={entity}
        columns={columns}
        exportFilename="reviews"
      />
      <ReviewRowActions entity={entity} tab={tab} approve={approve} reject={reject} setReplyRow={setReplyRow} setReplyText={setReplyText} />

      <Modal open={!!replyRow} onClose={() => setReplyRow(null)} title="Reply to Review" footer={<>
        <Button variant="secondary" onClick={() => setReplyRow(null)}>Cancel</Button>
        <Button onClick={submitReply}>Post Reply</Button>
      </>}>
        {replyRow && (
          <div className="flex flex-col gap-3">
            <div className="bg-surface-muted rounded-md p-3 text-[13px]">
              <p className="font-semibold mb-1">{replyRow.customerName} — {'★'.repeat(replyRow.rating || 0)}</p>
              <p className="text-ink-muted">{replyRow.comment}</p>
            </div>
            <Textarea rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a public reply…" />
          </div>
        )}
      </Modal>
    </div>
  );
}

// Adds Approve/Reject/Reply actions as an overlay of quick buttons under the table rows for the pending tab.
function ReviewRowActions({ entity, tab, approve, reject, setReplyRow, setReplyText }) {
  if (tab !== 'pending' || entity.rows.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 -mt-3 mb-1">
      {entity.rows.map((r) => (
        <div key={r._id || r.id} className="flex items-center gap-1.5 bg-surface border border-border-soft rounded-md px-2.5 py-1.5">
          <Badge tone="neutral" className="max-w-[140px] truncate">{r.customerName}</Badge>
          <Button size="sm" variant="secondary" onClick={() => approve(r)}>Approve</Button>
          <Button size="sm" variant="danger" onClick={() => reject(r)}>Reject</Button>
          <Button size="sm" variant="subtle" onClick={() => { setReplyRow(r); setReplyText(r.reply || ''); }}>Reply</Button>
        </div>
      ))}
    </div>
  );
}
