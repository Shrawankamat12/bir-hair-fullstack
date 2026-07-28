import blogCommentApi from '../../api/blogComment.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { formatDate } from '../../lib/format.js';

export default function BlogCommentList() {
  const entity = useEntityList(blogCommentApi, { searchKeys: ['authorName', 'comment', 'postTitle'] });
  const columns = [
    { key: 'postTitle', label: 'Post' },
    { key: 'authorName', label: 'Author' },
    { key: 'comment', label: 'Comment', render: (r) => <span className="line-clamp-2 max-w-sm block">{r.comment}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status || 'pending'} /> },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
  ];
  return (
    <EntityListPage title="Blog Comments" subtitle="Moderate comments left on blog posts." entity={entity} columns={columns}
      exportFilename="blog-comments"
      filterOptions={[{ key: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }] }]}
      statusOptions={[{ value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]} />
  );
}
