import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { Select } from '../ui/Input';
import { getMemberId } from '../../utils/group';

export default function TransferLeadershipModal({ open, onClose, members = [], onSubmit, loading }) {
  const [newLeader, setNewLeader] = useState('');
  const candidates = members.filter((m) => m.role !== 'leader');

  useEffect(() => {
    if (open) {
      const firstMember = candidates[0];
      setNewLeader(firstMember?.studentId?._id || firstMember?.studentId || '');
    } else {
      setNewLeader('');
    }
  }, [open, candidates]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Transfer leadership"
      description="Select a member to become the new leader."
      primaryAction={
        candidates.length
          ? {
              label: 'Transfer',
              onClick: () => onSubmit(newLeader),
              loading
            }
          : null
      }
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      {candidates.length === 0 ? (
        <p className="text-sm text-gray-500">No eligible members to transfer leadership.</p>
      ) : (
        <Select value={newLeader} onChange={(e) => setNewLeader(e.target.value)}>
          {candidates.map((member) => {
            const id = getMemberId(member);
            const name = member.fullName || member.studentId?.fullName || 'Member';
            return (
              <option key={id} value={id}>
                {name}
              </option>
            );
          })}
        </Select>
      )}
    </Modal>
  );
}
