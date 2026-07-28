import { useState } from 'react';
import faqApi from '../../api/faq.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import SimpleEntityForm from '../../components/crud/SimpleEntityForm.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';

export default function FaqList() {
  const entity = useEntityList(faqApi, { searchKeys: ['question', 'category'] });
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: 'question', label: 'Question', required: true, span: 2 },
    { name: 'answer', label: 'Answer', type: 'textarea', required: true, span: 2 },
    { name: 'category', label: 'Category', placeholder: 'Shipping, Returns, Products…' },
    { name: 'sortOrder', label: 'Sort Order', type: 'number' },
    { name: 'status', label: 'Active', type: 'switch' },
  ];
  const columns = [
    { key: 'question', label: 'Question', sortable: true, render: (r) => <span className="line-clamp-1 max-w-sm block font-medium">{r.question}</span> },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'active' : 'inactive'} /> },
  ];
  const submit = async (values) => {
    if (editing) { await entity.update(editing._id || editing.id, values); toast.success('FAQ updated'); }
    else { await entity.create(values); toast.success('FAQ created'); }
  };
  return (
    <div>
      <EntityListPage title="FAQs" subtitle="Frequently asked questions shown on the storefront." entity={entity} columns={columns}
        onAdd={() => { setEditing(null); setFormOpen(true); }} addLabel="Add FAQ"
        onEdit={(row) => { setEditing(row); setFormOpen(true); }} exportFilename="faqs"
        statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]} />
      <SimpleEntityForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} title={editing ? 'Edit FAQ' : 'Add FAQ'} fields={fields} initialValues={editing || { status: true }} />
    </div>
  );
}
