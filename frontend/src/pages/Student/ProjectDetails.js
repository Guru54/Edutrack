import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { milestoneAPI, projectAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { formatDate } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [milestoneForm, setMilestoneForm] = useState({ title: '', dueDate: '', description: '' });
  const [feedbackModal, setFeedbackModal] = useState({ open: false, milestoneId: null });
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [projectRes, milestonesRes] = await Promise.all([
        projectAPI.getById(id),
        milestoneAPI.getByProject(id)
      ]);
      setProject(projectRes.data.project || projectRes.data);
      setMilestones(milestonesRes.data.milestones || []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneForm.title || !milestoneForm.dueDate) {
      showError('Milestone title and due date are required');
      return;
    }
    try {
      setSubmitting(true);
      await milestoneAPI.create(id, milestoneForm);
      showSuccess('Milestone added');
      setMilestoneForm({ title: '', dueDate: '', description: '' });
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Unable to add milestone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWork = async () => {
    if (!submissionFile || !feedbackModal.milestoneId) return;
    const data = new FormData();
    data.append('file', submissionFile);
    try {
      setSubmitting(true);
      await milestoneAPI.submit(feedbackModal.milestoneId, data);
      showSuccess('Submission uploaded');
      setFeedbackModal({ open: false, milestoneId: null });
      setSubmissionFile(null);
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="text-center">
        <p className="text-sm text-gray-500">Project not found.</p>
        <div className="mt-3">
          <Button variant="secondary" onClick={() => navigate('/student/projects')}>Back to projects</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-600">Project Details</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
        </div>
        <Badge status={project.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Summary">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between"><span>Type</span><span>{project.projectType}</span></div>
            <div className="flex justify-between"><span>Academic Year</span><span>{project.academicYear}</span></div>
            <div className="flex justify-between"><span>Semester</span><span>{project.semester}</span></div>
            <div className="flex justify-between"><span>Submitted</span><span>{formatDate(project.submissionDate)}</span></div>
          </div>
        </Card>
        <Card title="Guide">
          {project.guideId ? (
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{project.guideId.fullName}</p>
              <p className="text-gray-500 dark:text-gray-400">{project.guideId.department}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Awaiting guide allocation.</p>
          )}
        </Card>
        <Card title="Technology">
          <div className="flex flex-wrap gap-2">
            {project.technologyStack?.split(',').map(tag => (
              <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                {tag.trim()}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Objectives">
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-200">
            {(project.objectives || '').split('.').filter(Boolean).map((obj, idx) => (
              <li key={idx}>{obj.trim()}</li>
            ))}
          </ul>
        </Card>
        <Card title="Expected Outcomes">
          <p className="text-sm text-gray-700 dark:text-gray-200">{project.expectedOutcomes || 'Not specified'}</p>
        </Card>
      </div>

      <Card title="Milestones" description="Track and submit milestone deliverables">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {milestones.map(ms => (
              <div key={ms._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{ms.title}</p>
                    <p className="text-xs text-gray-500">Due {formatDate(ms.dueDate)}</p>
                  </div>
                  <Badge status={ms.status || 'pending'} />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{ms.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Submissions: {ms.submissions?.length || 0}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setFeedbackModal({ open: true, milestoneId: ms._id })}
                  >
                    Submit work
                  </Button>
                </div>
              </div>
            ))}
            {milestones.length === 0 && <p className="text-sm text-gray-500">No milestones yet.</p>}
          </div>

          <form onSubmit={handleCreateMilestone} className="grid gap-3 md:grid-cols-4">
            <Input
              label="Title"
              name="title"
              value={milestoneForm.title}
              onChange={e => setMilestoneForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              label="Due date"
              type="date"
              name="dueDate"
              value={milestoneForm.dueDate}
              onChange={e => setMilestoneForm(prev => ({ ...prev, dueDate: e.target.value }))}
            />
            <Textarea
              label="Description"
              name="description"
              rows={1}
              value={milestoneForm.description}
              onChange={e => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="flex items-end">
              <Button type="submit" loading={submitting}>Add milestone</Button>
            </div>
          </form>
        </div>
      </Card>

      <Modal
        open={feedbackModal.open}
        onClose={() => setFeedbackModal({ open: false, milestoneId: null })}
        title="Submit milestone work"
        description="Upload your deliverable or supporting document."
        primaryAction={{
          label: submitting ? 'Uploading...' : 'Upload',
          onClick: handleSubmitWork,
          loading: submitting
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setFeedbackModal({ open: false, milestoneId: null })
        }}
      >
        <div className="space-y-3">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.zip"
            onChange={e => setSubmissionFile(e.target.files?.[0])}
            className="text-sm"
          />
          {submissionFile && (
            <p className="text-sm text-gray-600 dark:text-gray-300">Selected: {submissionFile.name}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
