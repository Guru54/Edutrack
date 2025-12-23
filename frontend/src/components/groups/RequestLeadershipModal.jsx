import React from 'react';
import Modal from '../ui/Modal';

export default function RequestLeadershipModal({ open, onClose, onConfirm, loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request leadership"
      description="Notify your current leader that you want to take ownership of the group."
      primaryAction={{ label: 'Send Request', onClick: onConfirm, loading }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <p>Your leader will receive a notification about your request.</p>
    </Modal>
  );
}
