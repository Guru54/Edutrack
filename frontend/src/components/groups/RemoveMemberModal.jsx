import React from 'react';
import Modal from '../ui/Modal';

export default function RemoveMemberModal({ open, onClose, member, onConfirm, loading }) {
  const fullName = member?.fullName || member?.studentId?.fullName || 'this member';
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Remove member"
      description="Removing a member revokes their access to the project group."
      primaryAction={{ label: 'Remove', onClick: () => onConfirm(member), loading, variant: 'danger' }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <p>
        Are you sure you want to remove <span className="font-semibold">{fullName}</span> from the group?
      </p>
    </Modal>
  );
}
