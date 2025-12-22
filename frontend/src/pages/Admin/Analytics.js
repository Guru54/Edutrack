import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { analyticsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Analytics() {
  const { showError } = useNotification();
  const [statusData, setStatusData] = useState([]);
  const [guideWorkload, setGuideWorkload] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statusRes, workloadRes] = await Promise.all([
          analyticsAPI.getProjectStatus(),
          analyticsAPI.getGuideWorkload()
        ]);
        setStatusData(statusRes.data.data || statusRes.data || []);
        setGuideWorkload(workloadRes.data.data || workloadRes.data || []);
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to load analytics');
      }
    };
    load();
  }, [showError]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-brand-600">Analytics</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Trends & Workload</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Project status over time">
          {statusData.length === 0 ? (
            <p className="text-sm text-gray-500">No data</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statusData}>
                  <XAxis dataKey="label" stroke="#9ca3af" />
                  <YAxis allowDecimals={false} stroke="#9ca3af" />
                  <Tooltip />
                  <Line type="monotone" dataKey="proposed" stroke="#f59e0b" />
                  <Line type="monotone" dataKey="approved" stroke="#22c55e" />
                  <Line type="monotone" dataKey="in_progress" stroke="#2563eb" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Guide workload">
          {guideWorkload.length === 0 ? (
            <p className="text-sm text-gray-500">No data</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={guideWorkload}>
                  <XAxis dataKey="guide" stroke="#9ca3af" />
                  <YAxis allowDecimals={false} stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="projects" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
