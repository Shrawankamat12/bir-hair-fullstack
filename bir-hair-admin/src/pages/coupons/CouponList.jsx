import { useState } from 'react';
import couponApi from '../../api/coupon.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import SimpleEntityForm from '../../components/crud/SimpleEntityForm.jsx';
import { StatusBadge, Drawer, Button } from '../../components/ui/index.js';
import { useToast, EmptyState } from '../../components/ui/Feedback.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';

export default function CouponList() {
  const entity = useEntityList(couponApi, { searchKeys: ['code'] });
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [usageRow, setUsageRow] = useState(null);

  const fields = [
    { name: 'code', label: 'Coupon Code', required: true, placeholder: 'e.g. WELCOME10' },
    { name: 'type', label: 'Discount Type', type: 'select', required: true, options: [{ value: 'percentage', label: 'Percentage (%)' }, { value: 'flat', label: 'Flat Amount' }] },
    { name: 'value', label: 'Discount Value', type: 'number', required: true },
    { name: 'minOrderValue', label: 'Minimum Order Value', type: 'number' },
    { name: 'maxDiscount', label: 'Maximum Discount Cap', type: 'number' },
    { name: 'usageLimit', label: 'Usage Limit (total)', type: 'number' },
    { name: 'perUserLimit', label: 'Usage Limit (per customer)', type: 'number' },
    { name: 'startDate', label: 'Start Date', type: 'text', placeholder: 'YYYY-MM-DD' },
    { name: 'endDate', label: 'End Date', type: 'text', placeholder: 'YYYY-MM-DD' },
    { name: 'description', label: 'Description', type: 'textarea', span: 2 },
    { name: 'status', label: 'Active', type: 'switch' },
  ];

  const columns = [
    { key: 'code', label: 'Code', sortable: true, render: (r) => <code className="font-bold text-brand-magenta">{r.code}</code> },
    { key: 'type', label: 'Type', render: (r) => r.type === 'percentage' ? 'Percentage' : 'Flat' },
    { key: 'value', label: 'Value', render: (r) => r.type === 'percentage' ? `${r.value}%` : formatCurrency(r.value) },
    { key: 'usedCount', label: 'Used', render: (r) => `${r.usedCount ?? 0}${r.usageLimit ? ` / ${r.usageLimit}` : ''}` },
    { key: 'endDate', label: 'Expires', render: (r) => r.endDate ? formatDate(r.endDate) : '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'active' : 'inactive'} /> },
    { key: 'usage', label: 'Usage', render: (r) => <button type="button" onClick={() => setUsageRow(r)} className="text-brand-magenta text-xs font-semibold hover:underline">View</button> },
  ];

  const submit = async (values) => {
    if (editing) { await entity.update(editing._id || editing.id, values); toast.success('Coupon updated'); }
    else { await entity.create(values); toast.success('Coupon created'); }
  };

  return (
    <div>
      <EntityListPage
        title="Coupons"
        subtitle="Discount codes and promotional offers."
        entity={entity}
        columns={columns}
        onAdd={() => { setEditing(null); setFormOpen(true); }}
        addLabel="Add Coupon"
        onEdit={(row) => { setEditing(row); setFormOpen(true); }}
        exportFilename="coupons"
        statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]}
      />
      <SimpleEntityForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} title={editing ? 'Edit Coupon' : 'Add Coupon'} fields={fields} initialValues={editing || { status: true, type: 'percentage' }} />
      <Drawer open={!!usageRow} onClose={() => setUsageRow(null)} title={usageRow ? `Usage — ${usageRow.code}` : 'Usage'}>
        {usageRow?.usageHistory?.length ? (
          <div className="flex flex-col gap-2">
            {usageRow.usageHistory.map((u, i) => (
              <div key={i} className="flex justify-between text-[13px] border-b border-border-soft pb-2">
                <span>{u.customerName}</span><span className="text-ink-faint">{formatDate(u.usedAt)}</span>
              </div>
            ))}
          </div>
        ) : <EmptyState title="No usage recorded yet" />}
      </Drawer>
    </div>
  );
}
