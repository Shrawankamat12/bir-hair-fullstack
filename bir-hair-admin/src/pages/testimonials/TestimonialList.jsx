import { useState } from 'react';
import testimonialApi from '../../api/testimonial.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import SimpleEntityForm from '../../components/crud/SimpleEntityForm.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';

export default function TestimonialList() {
  const entity = useEntityList(testimonialApi, { searchKeys: ['customerName', 'message'] });
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: 'customerName', label: 'Customer Name', required: true },
    { name: 'photo', label: 'Photo', type: 'image' },
    { name: 'rating', label: 'Rating', type: 'number', placeholder: '1-5' },
    { name: 'message', label: 'Testimonial', type: 'textarea', required: true, span: 2 },
    { name: 'status', label: 'Active', type: 'switch' },
  ];
  const columns = [
    { key: 'photo', label: 'Photo', render: (r) => r.photo ? <img src={r.photo} className="h-9 w-9 rounded-full object-cover" /> : <div className="h-9 w-9 rounded-full bg-surface-muted" /> },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'rating', label: 'Rating', render: (r) => '★'.repeat(r.rating || 0) },
    { key: 'message', label: 'Message', render: (r) => <span className="line-clamp-1 max-w-xs block">{r.message}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'active' : 'inactive'} /> },
  ];
  const submit = async (values) => {
    if (editing) { await entity.update(editing._id || editing.id, values); toast.success('Testimonial updated'); }
    else { await entity.create(values); toast.success('Testimonial created'); }
  };
  return (
    <div>
      <EntityListPage title="Testimonials" subtitle="Customer testimonials shown on the storefront." entity={entity} columns={columns}
        onAdd={() => { setEditing(null); setFormOpen(true); }} addLabel="Add Testimonial"
        onEdit={(row) => { setEditing(row); setFormOpen(true); }} exportFilename="testimonials"
        statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]} />
      <SimpleEntityForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} title={editing ? 'Edit Testimonial' : 'Add Testimonial'} fields={fields} initialValues={editing || { status: true }} />
    </div>
  );
}
