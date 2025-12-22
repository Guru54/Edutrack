import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import AddMemberModal from '../../components/groups/AddMemberModal';
import RemoveMemberModal from '../../components/groups/RemoveMemberModal';
import TransferLeadershipModal from '../../components/groups/TransferLeadershipModal';
import LeaveGroupModal from '../../components/groups/LeaveGroupModal';
import RequestLeadershipModal from '../../components/groups/RequestLeadershipModal';
import { groupAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserGroupIcon } from '@heroicons/react/24/outline';

const MemberRow = ({ member, isLeader, onRemove }) => {
  const fullName = member.fullName || member.studentId?.fullName || 'Member';
  const role = member.role;
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          {fullName[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{fullName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{member.email || member.studentId?.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge status={role === 'leader' ? 'approved' : 'pending'}>{role}</Badge>
        {isLeader && role !== 'leader' && (
          <Button size="sm" variant="secondary" onClick={() => onRemove(member)}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({
    add: false,
    remove: false,
    transfer: false,
    leave: false,
    request: false
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGroup = useCallback(async () => {
    try {
      setLoading(true);
      const res = await groupAPI.getById(id);
      setGroup(res.data.group);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const isLeader = group?.members?.some(
    (m) =>
      m.role === 'leader' &&
      ((typeof m.studentId === 'string' && m.studentId === user?.id) || m.studentId?._id === user?.id)
  );

  const handleAddMember = async ({ email }) => {
    try {
      setActionLoading(true);
      await groupAPI.addMember(id, { email });
      showSuccess('Member added');
      setModalState((s) => ({ ...s, add: false }));
      fetchGroup();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (member) => {
    try {
      setActionLoading(true);
      await groupAPI.removeMember(id, { studentId: member.studentId?._id || member.studentId });
      showSuccess('Member removed');
      setModalState((s) => ({ ...s, remove: false }));
      fetchGroup();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setActionLoading(true);
      await groupAPI.leave(id);
      showSuccess('You left the group');
      navigate('/student/groups');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to leave group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransfer = async (newLeaderId) => {
    try {
      setActionLoading(true);
      await groupAPI.transferLeader(id, { newLeaderId });
      showSuccess('Leadership transferred');
      setModalState((s) => ({ ...s, transfer: false }));
      fetchGroup();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to transfer leadership');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequest = async () => {
    try {
      setActionLoading(true);
      await groupAPI.requestTransfer(id, {});
      showSuccess('Request sent to leader');
      setModalState((s) => ({ ...s, request: false }));
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to send request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!group) {
    return (
      <Card className="flex min-h-[30vh] items-center justify-center">
        <p className="text-gray-500">Group not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserGroupIcon className="h-8 w-8 text-brand-600" />
          <div>
            <p className="text-sm font-semibold text-brand-600">Group</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{group.groupName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {group.members?.length || 0} members • Leader-only management
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isLeader && (
            <>
              <Button onClick={() => setModalState((s) => ({ ...s, add: true }))}>Add Member</Button>
              <Button
                variant="secondary"
                onClick={() => setModalState((s) => ({ ...s, transfer: true }))}
                disabled={!group.members || group.members.length < 2}
              >
                Transfer Leadership
              </Button>
            </>
          )}
          {!isLeader && (
            <Button variant="secondary" onClick={() => setModalState((s) => ({ ...s, request: true }))}>
              Request Leadership
            </Button>
          )}
          <Button variant="danger" onClick={() => setModalState((s) => ({ ...s, leave: true }))}>
            Leave Group
          </Button>
        </div>
      </div>

      <Card title="Members">
        <div className="space-y-3">
          {group.members?.map((member) => (
            <MemberRow
              key={member.studentId?._id || member.studentId}
              member={member}
              isLeader={isLeader}
              onRemove={(m) => {
                setSelectedMember(m);
                setModalState((s) => ({ ...s, remove: true }));
              }}
            />
          ))}
        </div>
      </Card>

      <AddMemberModal
        open={modalState.add}
        onClose={() => setModalState((s) => ({ ...s, add: false }))}
        onSubmit={handleAddMember}
        loading={actionLoading}
      />

      <RemoveMemberModal
        open={modalState.remove}
        onClose={() => setModalState((s) => ({ ...s, remove: false }))}
        member={selectedMember}
        onConfirm={handleRemoveMember}
        loading={actionLoading}
      />

      <TransferLeadershipModal
        open={modalState.transfer}
        onClose={() => setModalState((s) => ({ ...s, transfer: false }))}
        members={group.members || []}
        onSubmit={handleTransfer}
        loading={actionLoading}
      />

      <LeaveGroupModal
        open={modalState.leave}
        onClose={() => setModalState((s) => ({ ...s, leave: false }))}
        onConfirm={handleLeaveGroup}
        loading={actionLoading}
      />

      <RequestLeadershipModal
        open={modalState.request}
        onClose={() => setModalState((s) => ({ ...s, request: false }))}
        onConfirm={handleRequest}
        loading={actionLoading}
      />
    </div>
  );
}
