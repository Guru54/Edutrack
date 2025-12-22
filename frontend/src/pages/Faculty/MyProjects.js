import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import { Select, Input } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { formatDate, getStatusLabel } from '../../utils/helpers';
import { projectAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function FacultyMyProjects() {
  const { showError } = useNotification();
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await projectAPI.getAll();
        setProjects(res.data.projects || []);
      } catch (error) {
        showError(error.response?.data?.message || 'Unable to load projects');
      }
    };
    load();
  }, [showError]);

  const filtered = useMemo(() => {
    return projects
      .filter(p => !status || p.status === status)
      .filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  }, [projects, status, search]);

  const columns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
        cell: info => info.getValue()
      },
      { header: 'Type', accessorKey: 'projectType' },
      { header: 'Status', accessorKey: 'status', cell: info => <Badge status={info.getValue()}>{getStatusLabel(info.getValue())}</Badge> },
      {
        header: 'Submitted',
        accessorKey: 'submissionDate',
        cell: info => formatDate(info.getValue())
      },
      {
        header: 'Team',
        accessorKey: 'groupId.groupName',
        cell: info => info.row.original?.groupId?.groupName || 'N/A'
      }
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-brand-600">Assigned projects</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Projects</h1>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Search by title" value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="proposed">Proposed</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
        </div>
        <DataTable data={filtered} columns={columns} pageSize={7} globalFilterPlaceholder="Search projects..." />
      </Card>
    </div>
  );
}
