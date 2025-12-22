import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { Select } from '../ui/Input';

export default function TransferLeadershipModal({ open, onClose, members = [], onSubmit, loading }) {
  const [newLeader, setNewLeader] = useState('');

  useEffect(() => {
    if (open) {
      const firstMember = members.find((m) => m.role !== 'leader');
      setNewLeader(firstMember?.studentId?._id || firstMember?.studentId || '');
    } else {
      setNewLeader('');
    }
  }, [open, members]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Transfer leadership"
      description="Select a member to become the new leader."
      primaryAction={{
        label: 'Transfer',
        onClick: () => onSubmit(newLeader),
        loading
      }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <Select value={newLeader} onChange={(e) => setNewLeader(e.target.value)}>
        {members
          .filter((m) => m.role !== 'leader')
          .map((member) => {
            const id = member.studentId?._id || member.studentId;
            const name = member.fullName || member.studentId?.fullName || 'Member';
            return (
              <option key={id} value={id}>
                {name}
              </option>
            );
          })}
      </Select>
    </Modal>
  );
}
