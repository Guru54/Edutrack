import React from 'react';
import Modal from '../ui/Modal';

export default function LeaveGroupModal({ open, onClose, onConfirm, loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Leave group"
      description="You will lose access to this group's proposals and milestones."
      primaryAction={{ label: 'Leave Group', onClick: onConfirm, loading, variant: 'danger' }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <p>Are you sure you want to leave this group?</p>
    </Modal>
  );
}
