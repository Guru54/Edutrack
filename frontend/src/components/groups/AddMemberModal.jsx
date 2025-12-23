import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { Input } from '../ui/Input';

export default function AddMemberModal({ open, onClose, onSubmit, loading }) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!open) setEmail('');
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add group member"
      description="Invite another student to join this group. Maximum 4 members are allowed."
      primaryAction={{
        label: 'Add Member',
        onClick: () => onSubmit({ email }),
        loading
      }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <Input
        label="Student email"
        placeholder="student@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </Modal>
  );
}
