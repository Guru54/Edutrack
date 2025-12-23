import React, { useCallback, useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { milestoneAPI, projectAPI, fileAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/helpers';

export default function Reviews() {
  const { showError, showSuccess } = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ open: false, milestoneId: null, comment: '', score: '', status: 'approved' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const projectsRes = await projectAPI.getAll();
      const projects = projectsRes.data.projects || [];
      const milestoneLists = await Promise.all(projects.map(p => milestoneAPI.getByProject(p._id).catch(() => ({ data: { milestones: [] } }))));
      const merged = milestoneLists.flatMap((res, idx) =>
        (res.data.milestones || []).map(m => ({ ...m, projectTitle: projects[idx]?.title }))
      );
      setItems(merged);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const submitFeedback = async () => {
    if (!feedback.comment.trim()) {
      showError('Feedback comment is required');
      return;
    }
    try {
      await milestoneAPI.provideFeedback(feedback.milestoneId, {
        feedbackText: feedback.comment,
        marks: feedback.score ? Number(feedback.score) : undefined,
        status: feedback.status
      });
      showSuccess('Feedback submitted');
      setFeedback({ open: false, milestoneId: null, comment: '', score: '', status: 'approved' });
      load();
    } catch (error) {
      showError(error.response?.data?.message || 'Unable to submit feedback');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-brand-600">Milestone Reviews</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Provide feedback & marks</h1>
      </div>

      <Card>
        {loading ? (
          <p className="text-sm text-gray-500">Loading submissions...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500">No milestone submissions available.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map(ms => (
              <Card key={ms._id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase text-gray-500">{ms.projectTitle}</p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{ms.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{ms.description}</p>
                  </div>
                  <Badge status={ms.status || 'pending'} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Due {formatDate(ms.dueDate)}</span>
                  <span>{ms.submissionDate ? 'Submitted' : 'Awaiting submission'}</span>
                </div>

                {ms.fileIds && ms.fileIds.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {ms.fileIds.map((file) => (
                      <a
                        key={file._id || file}
                        href={fileAPI.download(file._id || file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {file.fileName || 'Download submission'}
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => setFeedback({ open: true, milestoneId: ms._id, comment: '', score: '', status: 'approved' })}
                  >
                    Give feedback
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={feedback.open}
        onClose={() => setFeedback({ open: false, milestoneId: null, comment: '', score: '' })}
        title="Provide feedback"
        description="Share comments and marks for this milestone."
        primaryAction={{ label: 'Submit', onClick: submitFeedback }}
        secondaryAction={{ label: 'Cancel', onClick: () => setFeedback({ open: false, milestoneId: null, comment: '', score: '' }) }}
      >
        <div className="space-y-3">
          <Textarea
            rows={4}
            placeholder="Feedback comments"
            value={feedback.comment}
            onChange={e => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Score"
            value={feedback.score}
            onChange={e => setFeedback(prev => ({ ...prev, score: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
              value={feedback.status}
              onChange={e => setFeedback(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="approved">Approve</option>
              <option value="needs_revision">Needs Revision</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
