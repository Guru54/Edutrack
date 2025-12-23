import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { Input } from '../ui/Input';

export default function CreateGroupModal({ open, onClose, onSubmit, loading }) {
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (!open) setGroupName('');
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Group"
      description="Create a new group to start a project proposal. You will be the group leader."
      primaryAction={{
        label: 'Create Group',
        onClick: () => onSubmit({ groupName }),
        loading,
        disabled: !groupName.trim()
      }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <Input
        label="Group Name"
        placeholder="e.g., Team Alpha"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        required
      />
    </Modal>
  );
}
