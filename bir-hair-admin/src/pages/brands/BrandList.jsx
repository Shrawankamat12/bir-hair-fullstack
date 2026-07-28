import { useState } from 'react';
import brandApi from '../../api/brand.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import SimpleEntityForm from '../../components/crud/SimpleEntityForm.jsx';
import { StatusBadge, Badge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';

export default function BrandList() {
  const entity = useEntityList(brandApi, { searchKeys: ['name', 'website'] });
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: 'name', label: 'Brand Name', required: true },
    { name: 'website', label: 'Website', type: 'url', placeholder: 'https://…' },
    { name: 'description', label: 'Description', type: 'textarea', span: 2 },
    { name: 'logo', label: 'Logo', type: 'image' },
    { name: 'banner', label: 'Banner', type: 'image' },
    { name: 'seoTitle', label: 'SEO Title' },
    { name: 'seoDescription', label: 'SEO Description', type: 'textarea' },
    { name: 'featured', label: 'Featured', type: 'switch' },
    { name: 'status', label: 'Active', type: 'switch' },
  ];

  const columns = [
    { key: 'logo', label: 'Logo', render: (r) => r.logo ? <img src={r.logo} className="h-9 w-9 rounded object-cover border border-border-soft" /> : <div className="h-9 w-9 rounded bg-surface-muted" /> },
    { key: 'name', label: 'Brand', sortable: true },
    { key: 'website', label: 'Website', render: (r) => r.website ? <a href={r.website} target="_blank" rel="noreferrer" className="text-brand-magenta hover:underline">{r.website.replace(/^https?:\/\//, '')}</a> : '—' },
    { key: 'productCount', label: 'Products', render: (r) => r.productCount ?? 0 },
    { key: 'featured', label: 'Featured', render: (r) => r.featured ? <Badge tone="brand">Featured</Badge> : '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'active' : 'inactive'} /> },
  ];

  const submit = async (values) => {
    if (editing) { await entity.update(editing._id || editing.id, values); toast.success('Brand updated'); }
    else { await entity.create(values); toast.success('Brand created'); }
  };

  return (
    <div>
      <EntityListPage
        title="Brands"
        subtitle="Manage the brands products are associated with."
        entity={entity}
        columns={columns}
        onAdd={() => { setEditing(null); setFormOpen(true); }}
        addLabel="Add Brand"
        onEdit={(row) => { setEditing(row); setFormOpen(true); }}
        exportFilename="brands"
        statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]}
      />
      <SimpleEntityForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} title={editing ? 'Edit Brand' : 'Add Brand'} fields={fields} initialValues={editing || { status: true }} />
    </div>
  );
}
