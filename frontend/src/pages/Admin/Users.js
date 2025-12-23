import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Select, Input } from '../../components/ui/Input';
import { userAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function Users() {
  const { showError, showSuccess } = useNotification();
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await userAPI.getAll();
      setUsers(res.data.users || res.data.data || []);
    } catch (error) {
      showError(error.response?.data?.message || 'Unable to load users');
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return users
      .filter(u => !role || u.role === role)
      .filter(u => (u.fullName || u.email || '').toLowerCase().includes(search.toLowerCase()));
  }, [users, role, search]);

  const handleVerify = async (userId) => {
    try {
      await userAPI.verify(userId);
      showSuccess('User verified successfully');
      load();
    } catch (error) {
      showError(error.response?.data?.message || 'Unable to verify user');
    }
  };

  const columns = [
    { header: 'Name', accessorKey: 'fullName' },
    { header: 'Email', accessorKey: 'email' },
    { 
      header: 'Role', 
      accessorKey: 'role', 
      cell: info => (
        <Badge status={info.getValue() === 'admin' ? 'approved' : 'pending'}>
          {info.getValue()}
        </Badge>
      ) 
    },
    {
      header: 'Status',
      accessorKey: 'isVerified',
      cell: info => (
        <Badge status={info.getValue() ? 'approved' : 'rejected'}>
          {info.getValue() ? 'Verified' : 'Pending'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      cell: info => (
        <div className="flex gap-2">
          {!info.row.original.isVerified && (
            <Button size="sm" onClick={() => handleVerify(info.row.original._id)}>
              Verify
            </Button>
          )}
          {/* You can add more actions here like Delete or Edit */}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-brand-600">User Management</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage platform users</h1>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Search users" value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={role} onChange={e => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
        <DataTable data={filtered} columns={columns} pageSize={8} globalFilterPlaceholder="Search users..." />
      </Card>
    </div>
  );
}
