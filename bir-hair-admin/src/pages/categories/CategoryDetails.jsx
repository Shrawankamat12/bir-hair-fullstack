import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import categoryApi from '../../api/category.api.js';
import { PageHeader, Card, Button, Badge, StatusBadge } from '../../components/ui/index.js';
import { PageLoader, EmptyState } from '../../components/ui/Feedback.jsx';
import { formatDate } from '../../lib/format.js';

export default function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([categoryApi.getOne(id), categoryApi.getAll()])
      .then(([one, list]) => { setCategory(one); setAll(Array.isArray(list) ? list : list?.items || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader label="Loading category…" />;
  if (!category) return <EmptyState title="Category not found" />;

  const children = all.filter((c) => c.parentId === id);
  const related = all.filter((c) => c.parentId === category.parentId && (c._id || c.id) !== id).slice(0, 6);

  return (
    <div>
      <PageHeader
        title={category.name}
        breadcrumbs={[{ label: 'Categories', to: '/categories' }, { label: category.name }]}
        actions={<>
          <Button variant="secondary" onClick={() => navigate('/categories')}>Back to List</Button>
          <Button onClick={() => navigate(`/categories/${id}/edit`)}>Edit Category</Button>
        </>}
      />

      <div className="grid grid-cols-3 gap-5 items-start">
        <div className="col-span-3 lg:col-span-2 flex flex-col gap-5">
          {category.banner && <img src={category.banner} className="w-full rounded-lg border border-border-soft aspect-[16/6] object-cover" />}

          <Card title="Overview">
            <div className="flex gap-4">
              {category.image && <img src={category.image} className="h-20 w-20 rounded-md object-cover border border-border-soft shrink-0" />}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13.5px] flex-1">
                <div><span className="text-ink-faint">Slug:</span> <code className="text-xs">{category.slug}</code></div>
                <div><span className="text-ink-faint">Status:</span> <StatusBadge status={category.status ? 'active' : 'inactive'} /></div>
                <div><span className="text-ink-faint">Featured:</span> {category.featured ? <Badge tone="brand">Yes</Badge> : 'No'}</div>
                <div><span className="text-ink-faint">Sort Order:</span> {category.sortOrder ?? 0}</div>
              </div>
            </div>
            {category.description && <p className="text-[13.5px] text-ink-muted mt-4 leading-relaxed">{category.description}</p>}
          </Card>

          <Card title={`Child Categories (${children.length})`}>
            {children.length === 0 ? <EmptyState title="No sub-categories yet" /> : (
              <div className="grid grid-cols-2 gap-3">
                {children.map((c) => (
                  <Link key={c._id || c.id} to={`/categories/${c._id || c.id}`} className="flex items-center gap-3 p-2.5 rounded-md border border-border-soft hover:border-brand-magenta transition-colors">
                    {c.image ? <img src={c.image} className="h-9 w-9 rounded object-cover" /> : <div className="h-9 w-9 rounded bg-surface-muted" />}
                    <span className="text-[13.5px] font-medium">{c.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card title={`Related Categories`}>
            {related.length === 0 ? <EmptyState title="No sibling categories" /> : (
              <div className="flex flex-wrap gap-2">
                {related.map((c) => <Badge key={c._id || c.id} tone="neutral">{c.name}</Badge>)}
              </div>
            )}
          </Card>
        </div>

        <div className="col-span-3 lg:col-span-1 flex flex-col gap-5">
          <Card title="Statistics">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Products" value={category.productCount ?? 0} />
              <Stat label="Sub-Categories" value={children.length} />
            </div>
          </Card>
          <Card title="Record Info">
            <div className="flex flex-col gap-2 text-[13px]">
              <Row k="Created By" v={category.createdBy || '—'} />
              <Row k="Created Date" v={formatDate(category.createdAt)} />
              <Row k="Updated By" v={category.updatedBy || '—'} />
              <Row k="Updated Date" v={formatDate(category.updatedAt)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-surface-muted rounded-md p-3 text-center">
      <div className="text-xl font-bold text-ink">{value}</div>
      <div className="text-[11px] text-ink-faint font-medium">{label}</div>
    </div>
  );
}
function Row({ k, v }) {
  return <div className="flex justify-between border-b border-border-soft pb-2"><span className="text-ink-faint">{k}</span><span className="font-medium">{v}</span></div>;
}
