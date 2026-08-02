import { useState } from 'react';
import bannerApi from '../../api/banner.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import SimpleEntityForm from '../../components/crud/SimpleEntityForm.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';
import { formatDate } from '../../lib/format.js';
import { resolveMediaUrl } from '../../lib/media.js';

export default function BannerList() {
  const entity = useEntityList(bannerApi, { searchKeys: ['title'] });
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: 'title', label: 'Title', required: true },
    {
      name: 'placement',
      label: 'Placement',
      type: 'select',
      options: [
        { value: 'home-hero', label: 'Home Hero' },
        { value: 'home-strip', label: 'Home Strip' },
        { value: 'shop-top', label: 'Shop Top' },
        { value: 'deal-of-day', label: 'Deal of the Day' },
        { value: 'category-top', label: 'Category Top' },
        { value: 'popup', label: 'Popup' },
      ],
    },
    { name: 'image', label: 'Banner Image', type: 'image', required: true },
    { name: 'subtitle', label: 'Subtitle' },
    { name: 'ctaText', label: 'CTA Text', placeholder: 'e.g. Shop Now' },
    { name: 'ctaLink', label: 'CTA Link', type: 'url' },
    { name: 'startDate', label: 'Start Date', type: 'date' },
    { name: 'endDate', label: 'End Date', type: 'date' },
    { name: 'order', label: 'Sort Order', type: 'number' },
    { name: 'status', label: 'Active', type: 'switch' },
  ];

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (r) =>
        r.image ? (
          <img src={resolveMediaUrl(r.image)} alt={r.title} className="h-10 w-16 rounded object-cover border border-border-soft" />
        ) : (
          <div className="h-10 w-16 rounded bg-surface-muted" />
        ),
    },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'placement', label: 'Placement' },
    { key: 'endDate', label: 'Scheduled Until', render: (r) => (r.endDate ? formatDate(r.endDate) : '—') },
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
        filterOptions={[{ key: 'placement', label: 'Placement', options: [
          { value: 'home-hero', label: 'Home Hero' },
          { value: 'home-strip', label: 'Home Strip' },
          { value: 'shop-top', label: 'Shop Top' },
          { value: 'deal-of-day', label: 'Deal of the Day' },
          { value: 'category-top', label: 'Category Top' },
          { value: 'popup', label: 'Popup' },
        ] }]}
        statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]}
      />
      <SimpleEntityForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} title={editing ? 'Edit Banner' : 'Add Banner'} fields={fields} initialValues={editing || { status: true, placement: 'home-hero' }} />
    </div>
  );
}