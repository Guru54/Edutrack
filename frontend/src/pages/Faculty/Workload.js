import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import { projectAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function Workload() {
  const { showError } = useNotification();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await projectAPI.getAll();
        setProjects(res.data.projects || []);
      } catch (error) {
        showError(error.response?.data?.message || 'Unable to load workload');
      }
    };
    load();
  }, [showError]);

  const statusData = useMemo(() => {
    const counts = projects.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ status: key.replace('_', ' '), value: counts[key] }));
  }, [projects]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-brand-600">Workload</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Project distribution</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Overview">
          <p className="text-4xl font-semibold text-gray-900 dark:text-gray-100">{projects.length}</p>
          <p className="text-sm text-gray-500">Total projects assigned</p>
        </Card>
        <Card title="By status">
          {statusData.length === 0 ? (
            <p className="text-sm text-gray-500">No data</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="status" stroke="#9ca3af" />
                  <YAxis allowDecimals={false} stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
