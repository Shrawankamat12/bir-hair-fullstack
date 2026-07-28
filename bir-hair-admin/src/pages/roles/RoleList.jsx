import { useState } from 'react';
import roleApi from '../../api/role.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { Modal, Button, FormField, Input, Switch, Checkbox, StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';

const MODULES = [
  'Products', 'Categories', 'Sub Categories', 'Brands', 'Collections', 'Hair Attributes',
  'Orders', 'Customers', 'Inventory', 'Coupons', 'Banners', 'Blog', 'Media Library',
  'Reviews', 'Testimonials', 'FAQs', 'Wholesale Leads', 'Messages', 'Newsletter',
  'Reports', 'Users', 'Roles', 'Settings',
];
const ACTIONS = ['view', 'create', 'edit', 'delete'];
const emptyPerms = () => MODULES.reduce((acc, m) => ({ ...acc, [m]: [] }), {});

export default function RoleList() {
  const entity = useEntityList(roleApi, { searchKeys: ['name'] });
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [perms, setPerms] = useState(emptyPerms());

  const openAdd = () => { setEditing(null); setName(''); setActive(true); setPerms(emptyPerms()); setFormOpen(true); };
  const openEdit = (row) => {
    setEditing(row); setName(row.name); setActive(row.isActive !== false);
    setPerms({ ...emptyPerms(), ...(row.permissionMatrix || {}) });
    setFormOpen(true);
  };

  const toggle = (mod, action) => setPerms((p) => ({
    ...p,
    [mod]: p[mod].includes(action) ? p[mod].filter((a) => a !== action) : [...p[mod], action],
  }));

  const submit = async () => {
    const payload = { name, isActive: active, permissionMatrix: perms, permissions: MODULES.filter((m) => perms[m].length > 0) };
    if (editing) { await entity.update(editing._id || editing.id, payload); toast.success('Role updated'); }
    else { await entity.create(payload); toast.success('Role created'); }
    setFormOpen(false);
  };

  const columns = [
    { key: 'name', label: 'Role Name', sortable: true },
    { key: 'permissions', label: 'Access', render: (r) => (r.permissions || []).slice(0, 4).join(', ') + ((r.permissions?.length || 0) > 4 ? ` +${r.permissions.length - 4} more` : '') || '—' },
    { key: 'isActive', label: 'Status', render: (r) => <StatusBadge status={r.isActive === false ? 'inactive' : 'active'} /> },
  ];

  return (
    <div>
      <EntityListPage
        title="Roles & Permissions"
        subtitle="Define staff roles and their module-level access."
        entity={entity}
        columns={columns}
        onAdd={openAdd}
        addLabel="Add Role"
        onEdit={openEdit}
        exportFilename="roles"
      />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Role' : 'Add Role'} size="xl" footer={<>
        <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
        <Button onClick={submit}>Save Role</Button>
      </>}>
        <div className="flex flex-col gap-5">
          <div className="flex gap-4 items-end">
            <FormField label="Role Name" required className="flex-1"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Store Manager" /></FormField>
            <Switch checked={active} onChange={setActive} label="Active" />
          </div>
          <div>
            <p className="text-[12.5px] font-semibold text-ink-muted mb-2">Module Permissions</p>
            <div className="overflow-x-auto border border-border-soft rounded-md">
              <table className="w-full text-[12.5px]">
                <thead><tr className="bg-surface-muted text-left"><th className="px-3 py-2">Module</th>{ACTIONS.map((a) => <th key={a} className="px-3 py-2 capitalize text-center">{a}</th>)}</tr></thead>
                <tbody>
                  {MODULES.map((mod) => (
                    <tr key={mod} className="border-t border-border-soft">
                      <td className="px-3 py-1.5 font-medium">{mod}</td>
                      {ACTIONS.map((a) => (
                        <td key={a} className="px-3 py-1.5 text-center"><Checkbox checked={perms[mod].includes(a)} onChange={() => toggle(mod, a)} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
