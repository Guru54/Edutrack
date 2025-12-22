import React, { useCallback, useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { projectAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/helpers';

export default function ReviewQueue() {
  const { showError, showSuccess } = useNotification();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, projectId: null, reason: '' });
  const [processingId, setProcessingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getAll({ status: 'proposed' });
      setQueue(res.data.projects || []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch review queue');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await projectAPI.approve(id);
      showSuccess('Proposal approved');
      load();
    } catch (error) {
      showError(error.response?.data?.message || 'Unable to approve proposal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      showError('Please provide a rejection comment');
      return;
    }
    try {
      setProcessingId(rejectModal.projectId);
      await projectAPI.reject(rejectModal.projectId, rejectModal.reason);
      showSuccess('Proposal rejected');
      setRejectModal({ open: false, projectId: null, reason: '' });
      load();
    } catch (error) {
      showError(error.response?.data?.message || 'Unable to reject proposal');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-brand-600">Review Queue</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pending proposals</h1>
      </div>

      <Card>
        {loading ? (
          <p className="text-sm text-gray-500">Loading proposals...</p>
        ) : queue.length === 0 ? (
          <p className="text-sm text-gray-500">No pending proposals.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {queue.map(item => (
              <Card key={item._id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">{item.projectType}</span>
                      <span>Submitted {formatDate(item.submissionDate)}</span>
                    </div>
                  </div>
                  <Badge status={item.status} />
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setRejectModal({ open: true, projectId: item._id, reason: '' })}
                    disabled={processingId === item._id}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(item._id)}
                    loading={processingId === item._id}
                  >
                    Approve
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, projectId: null, reason: '' })}
        title="Reject proposal"
        description="Please provide a comment for the student."
        primaryAction={{
          label: processingId ? 'Rejecting...' : 'Reject',
          onClick: handleReject,
          loading: !!processingId
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setRejectModal({ open: false, projectId: null, reason: '' })
        }}
      >
        <Textarea
          rows={4}
          value={rejectModal.reason}
          onChange={e => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
          placeholder="Explain the reason for rejection"
        />
      </Modal>
    </div>
  );
}
