import { useState } from 'react';
import attributeApi from '../../api/attribute.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import SimpleEntityForm from '../../components/crud/SimpleEntityForm.jsx';
import { Tabs, StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';

const TYPES = [
  { value: 'hairType', label: 'Hair Type' },
  { value: 'hairTexture', label: 'Hair Texture' },
  { value: 'hairLength', label: 'Hair Length' },
  { value: 'hairColour', label: 'Hair Colour' },
  { value: 'hairDensity', label: 'Hair Density' },
  { value: 'hairWeight', label: 'Hair Weight' },
  { value: 'hairOrigin', label: 'Hair Origin' },
];

export default function AttributeList() {
  const [activeType, setActiveType] = useState('hairType');
  const entity = useEntityList(attributeApi, { initialFilters: { type: 'hairType' }, searchKeys: ['name', 'value'] });
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const changeTab = (val) => {
    setActiveType(val);
    entity.setFilters({ type: val });
  };

  const counts = TYPES.reduce((acc, t) => {
    acc[t.value] = entity.allRows.filter((r) => r.type === t.value).length;
    return acc;
  }, {});

  const fields = [
    { name: 'name', label: 'Name', required: true, placeholder: 'e.g. Kinky Straight, 18 inch, Natural Black' },
    { name: 'value', label: 'Value / Code', placeholder: 'Internal value used in variant SKUs', hint: 'Optional short code, e.g. "18in", "1B"' },
    { name: 'colorSwatch', label: 'Colour Swatch', type: activeType === 'hairColour' ? 'text' : undefined, placeholder: activeType === 'hairColour' ? '#1a1a1a' : undefined },
    { name: 'sortOrder', label: 'Sort Order', type: 'number', placeholder: '0' },
    { name: 'status', label: 'Active', type: 'switch', switchLabel: 'Visible in product forms & storefront filters' },
  ].filter((f) => activeType === 'hairColour' || f.name !== 'colorSwatch');

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'value', label: 'Value / Code' },
    { key: 'productCount', label: 'Products', render: (r) => r.productCount ?? 0 },
    { key: 'sortOrder', label: 'Sort', sortable: true },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'active' : 'inactive'} /> },
  ];

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (row) => { setEditing(row); setFormOpen(true); };

  const submit = async (values) => {
    const payload = { ...values, type: activeType };
    if (editing) {
      await entity.update(editing._id || editing.id, payload);
      toast.success('Attribute updated');
    } else {
      await entity.create(payload);
      toast.success('Attribute created');
    }
  };

  const activeLabel = TYPES.find((t) => t.value === activeType)?.label;

  return (
    <div>
      <Tabs tabs={TYPES.map((t) => ({ ...t, count: counts[t.value] }))} active={activeType} onChange={changeTab} />
      <EntityListPage
        title="Hair Attributes"
        subtitle="Manage the hair-specific attribute sets used across products and storefront filtering."
        entity={entity}
        columns={columns}
        onAdd={openAdd}
        addLabel={`Add ${activeLabel}`}
        onEdit={openEdit}
        exportFilename={activeType}
        statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]}
      />
      <SimpleEntityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={submit}
        title={editing ? `Edit ${activeLabel}` : `Add ${activeLabel}`}
        fields={fields}
        initialValues={editing || { status: true }}
      />
    </div>
  );
}
