import { useEffect, useState } from 'react';
import subcategoryApi from '../../api/subcategory.api.js';
import categoryApi from '../../api/category.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import SimpleEntityForm from '../../components/crud/SimpleEntityForm.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';
import { resolveMediaUrl } from '../../lib/media.js';

export default function SubcategoryList() {
  const entity = useEntityList(subcategoryApi, { searchKeys: ['name', 'slug'] });
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    categoryApi.getAll().then((d) => setCategories(Array.isArray(d) ? d : d?.items || [])).catch(() => setCategories([]));
  }, []);

  const categoryName = (id) => categories.find((c) => (c._id || c.id) === id)?.name || '—';

  const fields = [
    { name: 'name', label: 'Sub-Category Name', required: true, autoSlugFrom: undefined },
    { name: 'slug', label: 'Slug', required: true },
    { name: 'categoryId', label: 'Parent Category', type: 'select', required: true, options: categories.map((c) => ({ value: c._id || c.id, label: c.name })) },
    { name: 'image', label: 'Image', type: 'image' },
    { name: 'description', label: 'Description', type: 'textarea', span: 2 },
    { name: 'sortOrder', label: 'Sort Order', type: 'number' },
    { name: 'status', label: 'Active', type: 'switch' },
  ];

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (r) =>
        r.image ? (
          <img src={resolveMediaUrl(r.image)} alt={r.name} className="h-9 w-9 rounded object-cover border border-border-soft" />
        ) : (
          <div className="h-9 w-9 rounded bg-surface-muted" />
        ),
    },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'categoryId', label: 'Parent Category', render: (r) => categoryName(r.categoryId) },
    { key: 'productCount', label: 'Products', render: (r) => r.productCount ?? 0 },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'active' : 'inactive'} /> },
  ];

  const submit = async (values) => {
    if (editing) { await entity.update(editing._id || editing.id, values); toast.success('Sub-category updated'); }
    else { await entity.create(values); toast.success('Sub-category created'); }
  };

  return (
    <div>
      <EntityListPage
        title="Sub Categories"
        subtitle="Second-level catalog grouping nested under a parent category."
        entity={entity}
        columns={columns}
        onAdd={() => { setEditing(null); setFormOpen(true); }}
        addLabel="Add Sub Category"
        onEdit={(row) => { setEditing(row); setFormOpen(true); }}
        exportFilename="subcategories"
        filterOptions={[{ key: 'categoryId', label: 'Category', options: categories.map((c) => ({ value: c._id || c.id, label: c.name })) }]}
        statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]}
      />
      <SimpleEntityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={submit}
        title={editing ? 'Edit Sub-Category' : 'Add Sub-Category'}
        fields={fields}
        initialValues={editing || { status: true }}
      />
    </div>
  );
}