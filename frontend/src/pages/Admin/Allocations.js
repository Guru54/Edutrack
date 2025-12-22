import React, { useCallback, useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { allocationAPI, projectAPI, userAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/helpers';

export default function Allocations() {
  const { showError, showSuccess } = useNotification();
  const [projects, setProjects] = useState([]);
  const [guides, setGuides] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, guideRes] = await Promise.all([
        projectAPI.getAll(),
        userAPI.getGuides()
      ]);
      setProjects((projRes.data.projects || []).filter(p => !p.guideId));
      setGuides(guideRes.data.data || []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load allocation data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssign = async (projectId) => {
    const guideId = assignments[projectId];
    if (!guideId) {
      showError('Select a guide to assign');
      return;
    }
    try {
      await allocationAPI.assignGuide({ projectId, guideId });
      showSuccess('Guide assigned');
      load();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to assign guide');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-brand-600">Guide Allocation</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assign guides to projects</h1>
      </div>

      <Card>
        {loading ? (
          <p className="text-sm text-gray-500">Loading allocations...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-gray-500">All projects have guides assigned.</p>
        ) : (
          <div className="space-y-3">
            {projects.map(project => (
              <div key={project._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{project.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Submitted {formatDate(project.submissionDate)}</p>
                  </div>
                  <div className="w-64 space-y-2">
                    <Select
                      value={assignments[project._id] || ''}
                      onChange={e => setAssignments(prev => ({ ...prev, [project._id]: e.target.value }))}
                    >
                      <option value="">Select guide</option>
                      {guides.map(g => (
                        <option key={g._id} value={g._id}>
                          {g.fullName} ({g.currentProjects} active)
                        </option>
                      ))}
                    </Select>
                    <Button onClick={() => handleAssign(project._id)}>Assign</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
