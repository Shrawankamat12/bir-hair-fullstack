import { useEffect, useState } from 'react';
import userApi from '../../api/user.api.js';
import roleApi from '../../api/role.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import SimpleEntityForm from '../../components/crud/SimpleEntityForm.jsx';
import { StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';
import { formatDate } from '../../lib/format.js';

export default function UserList() {
  const entity = useEntityList(userApi, { searchKeys: ['name', 'email'] });
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { roleApi.getAll().then((d) => setRoles(Array.isArray(d) ? d : d?.items || [])).catch(() => setRoles([])); }, []);
  const roleName = (id) => roles.find((r) => (r._id || r.id) === id)?.name || '—';

  const fields = [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone' },
    { name: 'roleId', label: 'Role', type: 'select', required: true, options: roles.map((r) => ({ value: r._id || r.id, label: r.name })) },
    { name: 'status', label: 'Active', type: 'switch' },
  ];

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'roleId', label: 'Role', render: (r) => roleName(r.roleId) },
    { key: 'lastLogin', label: 'Last Login', render: (r) => r.lastLogin ? formatDate(r.lastLogin) : 'Never' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'active' : 'inactive'} /> },
  ];

  const submit = async (values) => {
    if (editing) { await entity.update(editing._id || editing.id, values); toast.success('User updated'); }
    else { await entity.create(values); toast.success('User created'); }
  };

  return (
    <div>
      <EntityListPage title="Users" subtitle="Staff accounts with admin panel access." entity={entity} columns={columns}
        onAdd={() => { setEditing(null); setFormOpen(true); }} addLabel="Add User"
        onEdit={(row) => { setEditing(row); setFormOpen(true); }} exportFilename="users"
        filterOptions={[{ key: 'roleId', label: 'Role', options: roles.map((r) => ({ value: r._id || r.id, label: r.name })) }]}
        statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]} />
      <SimpleEntityForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} title={editing ? 'Edit User' : 'Add User'} fields={fields} initialValues={editing || { status: true }} />
    </div>
  );
}
