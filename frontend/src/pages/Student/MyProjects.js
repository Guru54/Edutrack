import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import { Select, Input } from '../../components/ui/Input';
import { formatDate, getStatusLabel } from '../../utils/helpers';

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'proposed', label: 'Proposed' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' }
];

export default function MyProjects() {
  const { showError } = useNotification();
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await projectAPI.getAll();
        setProjects(res.data.projects || []);
      } catch (error) {
        showError(error.response?.data?.message || 'Unable to load projects');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showError]);

  const filtered = useMemo(() => {
    return projects
      .filter(p => !statusFilter || p.status === statusFilter)
      .filter(p => !typeFilter || p.projectType === typeFilter)
      .filter(
        p =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.description || '').toLowerCase().includes(search.toLowerCase())
      );
  }, [projects, statusFilter, typeFilter, search]);

  const columns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
        cell: info => (
          <Link className="font-semibold text-brand-600 hover:underline" to={`/student/projects/${info.row.original._id}`}>
            {info.getValue()}
          </Link>
        )
      },
      {
        header: 'Type',
        accessorKey: 'projectType',
        cell: info => <span className="rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">{info.getValue()}</span>
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: info => <Badge status={info.getValue()}>{getStatusLabel(info.getValue())}</Badge>
      },
      {
        header: 'Guide',
        accessorKey: 'guideId.fullName',
        cell: info => info.row.original?.guideId?.fullName || 'Unassigned'
      },
      {
        header: 'Updated',
        accessorKey: 'updatedAt',
        cell: info => formatDate(info.getValue())
      }
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-600">My Projects</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All proposals and active projects</h1>
        </div>
        <Link to="/student/new-proposal">
          <Button>New Proposal</Button>
        </Link>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Search by title or description" value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="Minor Project">Minor Project</option>
            <option value="Major Project">Major Project</option>
          </Select>
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} projects</span>
          </div>
        </div>
        <DataTable data={filtered} columns={columns} pageSize={6} globalFilterPlaceholder="Search projects..." />
        {loading && <p className="text-sm text-gray-500">Loading...</p>}
      </Card>
    </div>
  );
}
