import { useState } from 'react';
import blogCategoryApi from '../../api/blogCategory.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import SimpleEntityForm from '../../components/crud/SimpleEntityForm.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';
import { slugify } from '../../lib/format.js';

export default function BlogCategoryList() {
  const entity = useEntityList(blogCategoryApi, { searchKeys: ['name'] });
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: 'name', label: 'Category Name', required: true },
    { name: 'slug', label: 'Slug', required: true },
    { name: 'status', label: 'Active', type: 'switch' },
  ];
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'slug', label: 'Slug', render: (r) => <code className="text-xs">{r.slug}</code> },
    { key: 'postCount', label: 'Posts', render: (r) => r.postCount ?? 0 },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'active' : 'inactive'} /> },
  ];
  const submit = async (values) => {
    const payload = { ...values, slug: values.slug || slugify(values.name) };
    if (editing) { await entity.update(editing._id || editing.id, payload); toast.success('Category updated'); }
    else { await entity.create(payload); toast.success('Category created'); }
  };
  return (
    <div>
      <EntityListPage title="Blog Categories" subtitle="Group blog posts by topic." entity={entity} columns={columns}
        onAdd={() => { setEditing(null); setFormOpen(true); }} addLabel="Add Category"
        onEdit={(row) => { setEditing(row); setFormOpen(true); }} exportFilename="blog-categories"
        statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]} />
      <SimpleEntityForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} title={editing ? 'Edit Category' : 'Add Category'} fields={fields} initialValues={editing || { status: true }} />
    </div>
  );
}
