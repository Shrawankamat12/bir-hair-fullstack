import { useNavigate } from 'react-router-dom';
import blogApi from '../../api/blog.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { formatDate } from '../../lib/format.js';

export default function BlogList() {
  const navigate = useNavigate();
  const entity = useEntityList(blogApi, { searchKeys: ['title', 'category'] });

  const columns = [
    { key: 'image', label: 'Image', render: (r) => r.image ? <img src={r.image} className="h-10 w-14 rounded object-cover border border-border-soft" /> : <div className="h-10 w-14 rounded bg-surface-muted" /> },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'category', label: 'Category' },
    { key: 'tags', label: 'Tags', render: (r) => (r.tags || []).slice(0, 3).join(', ') || '—' },
    { key: 'isPublished', label: 'Status', render: (r) => <StatusBadge status={r.isPublished ? 'published' : 'draft'} /> },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <EntityListPage
      title="Blog"
      subtitle="Articles, guides and news for the storefront blog."
      entity={entity}
      columns={columns}
      onAdd={() => navigate('/blogs/new')}
      addLabel="Add Blog Post"
      onEdit={(row) => navigate(`/blogs/${row._id || row.id}/edit`)}
      exportFilename="blogs"
      filterOptions={[{ key: 'isPublished', label: 'Status', options: [{ value: 'true', label: 'Published' }, { value: 'false', label: 'Draft' }] }]}
      statusOptions={[{ value: true, label: 'Published' }, { value: false, label: 'Draft' }]}
    />
  );
}
