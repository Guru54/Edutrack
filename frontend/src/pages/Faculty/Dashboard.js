import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatDate, getStatusLabel } from '../../utils/helpers';
import { CheckBadgeIcon, InboxStackIcon, ClockIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import Spinner from '../../components/ui/Spinner';

const Stat = ({ icon: Icon, title, value, accent }) => {
  const styles = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200'
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </Card>
  );
};

const FacultyDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  const fetchDashboardData = useCallback(async () => {
    try {
      const projectsRes = await projectAPI.getAll({ role: 'faculty' });
      setProjects(projectsRes.data.projects || []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = useMemo(() => ({
    total: projects.length,
    pending: projects.filter(p => p.status === 'proposed').length,
    approved: projects.filter(p => p.status === 'approved').length,
    active: projects.filter(p => p.status === 'in_progress').length
  }), [projects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-600">Faculty overview</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor your assigned projects and pending reviews.</p>
        </div>
        <Link to="/faculty/review-queue">
          <Button>Go to Review Queue</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ClipboardDocumentCheckIcon} title="Total Projects" value={stats.total} accent="brand" />
        <Stat icon={InboxStackIcon} title="Pending Reviews" value={stats.pending} accent="amber" />
        <Stat icon={CheckBadgeIcon} title="Approved" value={stats.approved} accent="green" />
        <Stat icon={ClockIcon} title="In Progress" value={stats.active} accent="blue" />
      </div>

      <Card title="Assigned Projects" description="Quick look at the projects you're guiding">
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500">No projects assigned yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {projects.map(project => (
              <Card key={project._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {project.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                    <p className="mt-2 text-xs text-gray-500">Submitted {formatDate(project.submissionDate)}</p>
                  </div>
                  <Badge status={project.status}>{getStatusLabel(project.status)}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>{project.projectType}</span>
                  <Link to={`/faculty/projects`} className="text-brand-600 hover:underline">View</Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FacultyDashboard;
