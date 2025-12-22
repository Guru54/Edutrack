import React, { useEffect, useState } from 'react';
import { milestoneAPI, projectAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import { Select, Input } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatDate } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

export default function Milestones() {
  const { showError, showSuccess } = useNotification();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState({ file: null, notes: '' });
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectAPI.getAll();
        const list = res.data.projects || [];
        setProjects(list);
        if (list.length) setSelectedProject(list[0]._id);
      } catch (error) {
        showError(error.response?.data?.message || 'Unable to load projects');
      }
    };
    loadProjects();
  }, [showError]);

  useEffect(() => {
    const loadMilestones = async () => {
      if (!selectedProject) return;
      setLoading(true);
      try {
        const res = await milestoneAPI.getByProject(selectedProject);
        setMilestones(res.data.milestones || []);
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to load milestones');
      } finally {
        setLoading(false);
      }
    };
    loadMilestones();
  }, [selectedProject, showError]);

  const handleSubmit = async () => {
    if (!selectedMilestone || !submission.file) {
      showError('Select a milestone and choose a file to submit');
      return;
    }
    const data = new FormData();
    data.append('file', submission.file);
    data.append('notes', submission.notes);
    try {
      setLoading(true);
      await milestoneAPI.submit(selectedMilestone, data);
      showSuccess('Submission uploaded');
      setSubmission({ file: null, notes: '' });
      setSelectedMilestone(null);
      const refreshed = await milestoneAPI.getByProject(selectedProject);
      setMilestones(refreshed.data.milestones || []);
    } catch (error) {
      showError(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-600">Milestones</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Track submissions</h1>
        </div>
        <Select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </Select>
      </div>

      <Card title="Upcoming & Active Milestones">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner size="sm" />
            Loading milestones...
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {milestones.map(ms => (
              <div key={ms._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{ms.title}</p>
                    <p className="text-xs text-gray-500">Due {formatDate(ms.dueDate)}</p>
                  </div>
                  <Badge status={ms.status || 'pending'} />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{ms.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{ms.submissions?.length || 0} submissions</span>
                  <Button
                    size="sm"
                    variant={selectedMilestone === ms._id ? 'primary' : 'secondary'}
                    onClick={() => setSelectedMilestone(ms._id)}
                  >
                    {selectedMilestone === ms._id ? 'Selected' : 'Submit'}
                  </Button>
                </div>
              </div>
            ))}
            {milestones.length === 0 && <p className="text-sm text-gray-500">No milestones for this project.</p>}
          </div>
        )}
      </Card>

      <Card title="Upload submission">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Input
              type="file"
              onChange={e => setSubmission(prev => ({ ...prev, file: e.target.files?.[0] }))}
            />
            {submission.file && <p className="text-xs text-gray-500 dark:text-gray-400">{submission.file.name}</p>}
          </div>
          <Input
            placeholder="Notes (optional)"
            value={submission.notes}
            onChange={e => setSubmission(prev => ({ ...prev, notes: e.target.value }))}
          />
          <div className="flex items-end">
            <Button onClick={handleSubmit} loading={loading}>Submit update</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
