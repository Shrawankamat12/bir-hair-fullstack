import { useState } from 'react';
import collectionApi from '../../api/collection.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import SimpleEntityForm from '../../components/crud/SimpleEntityForm.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';
import { slugify } from '../../lib/format.js';

export default function CollectionList() {
  const entity = useEntityList(collectionApi, { searchKeys: ['name', 'slug'] });
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: 'name', label: 'Collection Name', required: true, placeholder: 'e.g. Raw Hair, Virgin Hair, Bundles, Closure, Frontal, Wigs', autoSlugFrom: undefined },
    { name: 'slug', label: 'Slug', required: true },
    { name: 'image', label: 'Image', type: 'image' },
    { name: 'banner', label: 'Banner', type: 'image' },
    { name: 'description', label: 'Description', type: 'textarea', span: 2 },
    { name: 'seoTitle', label: 'SEO Title' },
    { name: 'seoDescription', label: 'SEO Description', type: 'textarea' },
    { name: 'status', label: 'Active', type: 'switch' },
  ];

  const columns = [
    { key: 'image', label: 'Image', render: (r) => r.image ? <img src={r.image} className="h-9 w-9 rounded object-cover border border-border-soft" /> : <div className="h-9 w-9 rounded bg-surface-muted" /> },
    { key: 'name', label: 'Collection', sortable: true },
    { key: 'slug', label: 'Slug', render: (r) => <code className="text-xs">{r.slug}</code> },
    { key: 'productCount', label: 'Products', render: (r) => r.productCount ?? 0 },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'active' : 'inactive'} /> },
  ];

  const submit = async (values) => {
    const payload = { ...values, slug: values.slug || slugify(values.name) };
    if (editing) { await entity.update(editing._id || editing.id, payload); toast.success('Collection updated'); }
    else { await entity.create(payload); toast.success('Collection created'); }
  };

  return (
    <div>
      <EntityListPage
        title="Collections"
        subtitle="Curated groupings like Raw Hair, Virgin Hair, Bundles, Closure, Frontal & Wigs."
        entity={entity}
        columns={columns}
        onAdd={() => { setEditing(null); setFormOpen(true); }}
        addLabel="Add Collection"
        onEdit={(row) => { setEditing(row); setFormOpen(true); }}
        exportFilename="collections"
        statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]}
      />
      <SimpleEntityForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} title={editing ? 'Edit Collection' : 'Add Collection'} fields={fields} initialValues={editing || { status: true }} />
    </div>
  );
}
