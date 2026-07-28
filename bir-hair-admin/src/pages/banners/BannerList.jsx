import { useState } from 'react';
import bannerApi from '../../api/banner.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import SimpleEntityForm from '../../components/crud/SimpleEntityForm.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';

export default function BannerList() {
  const entity = useEntityList(bannerApi, { searchKeys: ['title'] });
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: 'title', label: 'Title', required: true },
    { name: 'position', label: 'Placement', type: 'select', options: [{ value: 'home-hero', label: 'Home Hero' }, { value: 'home-strip', label: 'Home Strip' }, { value: 'category-top', label: 'Category Top' }, { value: 'popup', label: 'Popup' }] },
    { name: 'image', label: 'Banner Image', type: 'image' },
    { name: 'linkUrl', label: 'Link URL', type: 'url' },
    { name: 'startDate', label: 'Start Date', placeholder: 'YYYY-MM-DD' },
    { name: 'endDate', label: 'End Date', placeholder: 'YYYY-MM-DD' },
    { name: 'sortOrder', label: 'Sort Order', type: 'number' },
    { name: 'status', label: 'Active', type: 'switch' },
  ];

  const columns = [
    { key: 'image', label: 'Image', render: (r) => r.image ? <img src={r.image} className="h-10 w-16 rounded object-cover border border-border-soft" /> : <div className="h-10 w-16 rounded bg-surface-muted" /> },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'position', label: 'Placement' },
    { key: 'endDate', label: 'Scheduled Until', render: (r) => r.endDate || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'active' : 'inactive'} /> },
  ];

  const submit = async (values) => {
    if (editing) { await entity.update(editing._id || editing.id, values); toast.success('Banner updated'); }
    else { await entity.create(values); toast.success('Banner created'); }
  };

  return (
    <div>
      <EntityListPage
        title="Banners"
        subtitle="Homepage and category promotional banners with scheduling."
        entity={entity}
        columns={columns}
        onAdd={() => { setEditing(null); setFormOpen(true); }}
        addLabel="Add Banner"
        onEdit={(row) => { setEditing(row); setFormOpen(true); }}
        exportFilename="banners"
        statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]}
      />
      <SimpleEntityForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} title={editing ? 'Edit Banner' : 'Add Banner'} fields={fields} initialValues={editing || { status: true }} />
    </div>
  );
}
