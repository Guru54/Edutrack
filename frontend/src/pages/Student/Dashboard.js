import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate, getStatusLabel } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { BookOpenIcon, CheckCircleIcon, ClockIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, accent }) => {
  const accentClass = {
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
  }[accent];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClass}`}>
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

const StudentDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  const fetchDashboardData = useCallback(async () => {
    try {
      const projectsRes = await projectAPI.getAll();
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

  const stats = useMemo(() => {
    const total = projects.length;
    const proposed = projects.filter(p => p.status === 'proposed').length;
    const approved = projects.filter(p => p.status === 'approved').length;
    const inProgress = projects.filter(p => p.status === 'in_progress').length;
    return [
      { title: 'Total Projects', value: total, icon: BookOpenIcon, accent: 'brand' },
      { title: 'Proposed', value: proposed, icon: DocumentCheckIcon, accent: 'blue' },
      { title: 'Approved', value: approved, icon: CheckCircleIcon, accent: 'green' },
      { title: 'In Progress', value: inProgress, icon: ClockIcon, accent: 'amber' }
    ];
  }, [projects]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-600">Welcome back</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your proposals, projects and milestones at a glance.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/student/projects">
            <Button variant="secondary">View Projects</Button>
          </Link>
          <Link to="/student/new-proposal">
            <Button>New Proposal</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <Card title="My Projects" description="Recent activity and statuses" className="space-y-4">
        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Start by submitting a new proposal to kick off your project."
            action={{ label: 'Submit Proposal', onClick: () => (window.location.href = '/student/new-proposal') }}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.map(project => (
              <Card key={project._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {project.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {project.description}
                    </p>
                  </div>
                  <Badge status={project.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">{project.projectType}</span>
                  <span>Submitted: {formatDate(project.submissionDate)}</span>
                  {project.guideId && <span>Guide: {project.guideId.fullName}</span>}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <Link className="text-brand-600 hover:underline" to={`/student/projects/${project._id}`}>
                    View details
                  </Link>
                  <span className="text-gray-500 dark:text-gray-400">{getStatusLabel(project.status)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;
