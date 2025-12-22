import React, { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

const Stat = ({ label, value }) => (
  <Card className="p-4">
    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
  </Card>
);

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#9333ea'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const recentColumns = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Group', accessorKey: 'groupId.groupName', cell: info => info.row.original?.groupId?.groupName || 'N/A' },
    { header: 'Guide', accessorKey: 'guideId.fullName', cell: info => info.row.original?.guideId?.fullName || 'Not Assigned' },
    { header: 'Type', accessorKey: 'projectType' },
    { header: 'Status', accessorKey: 'status', cell: info => <Badge status={info.getValue()} /> }
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-600">Admin overview</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading analytics...</p>
      ) : analytics ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Total Projects" value={analytics.overview?.totalProjects ?? 0} />
            <Stat label="Students" value={analytics.overview?.totalStudents ?? 0} />
            <Stat label="Faculty" value={analytics.overview?.totalFaculty ?? 0} />
            <Stat label="Pending Reviews" value={analytics.overview?.pendingReviews ?? 0} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Project status distribution">
              {analytics.statusDistribution?.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie dataKey="value" data={analytics.statusDistribution} label>
                        {analytics.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data</p>
              )}
            </Card>

            <Card title="Guide workload">
              {analytics.guideWorkload?.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.guideWorkload}>
                      <XAxis dataKey="guide" stroke="#9ca3af" />
                      <YAxis allowDecimals={false} stroke="#9ca3af" />
                      <Tooltip />
                      <Bar dataKey="projects" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No workload data</p>
              )}
            </Card>
          </div>

          <Card title="Recent projects">
            {analytics.recentProjects?.length ? (
              <DataTable data={analytics.recentProjects} columns={recentColumns} pageSize={5} />
            ) : (
              <p className="text-sm text-gray-500">No projects yet.</p>
            )}
          </Card>
        </>
      ) : (
        <p className="text-sm text-gray-500">No analytics data available.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
