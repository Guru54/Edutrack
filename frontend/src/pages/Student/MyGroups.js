import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, groupAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import CreateGroupModal from '../../components/groups/CreateGroupModal';
import AddMemberModal from '../../components/groups/AddMemberModal';
import { UserGroupIcon, PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { getMemberId, isGroupLeader } from '../../utils/group';

const MemberAvatar = ({ member }) => {
  const fullName = member.fullName || member.studentId?.fullName || 'Student';
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800/60">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
        {fullName[0]?.toUpperCase() || '?'}
      </div>
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{fullName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
      </div>
    </div>
  );
};

export default function MyGroups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [addMemberModal, setAddMemberModal] = useState({ open: false, groupId: null });
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await userAPI.getUserGroups(user.id);
      setGroups(res.data.groups || []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [showError, user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreateGroup = async (data) => {
    try {
      setCreateLoading(true);
      const res = await groupAPI.create(data);
      showSuccess('Group created successfully');
      setIsCreateModalOpen(false);
      fetchGroups();
      // Optionally navigate to the new group
      if (res.data.group?._id) {
        navigate(`/student/groups/${res.data.group._id}`);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create group');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddMember = async ({ email }) => {
    try {
      setAddMemberLoading(true);
      await groupAPI.addMember(addMemberModal.groupId, { email });
      showSuccess('Member added successfully');
      setAddMemberModal({ open: false, groupId: null });
      fetchGroups();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add member');
    } finally {
      setAddMemberLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-600">My Groups</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Collaborate with your team</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your project groups and track membership.</p>
        </div>
        <div className="flex gap-3">
          {groups.length === 0 && (
            <Button onClick={() => setIsCreateModalOpen(true)} icon={PlusIcon}>
              Create Group
            </Button>
          )}
          <Button onClick={() => navigate('/student/new-proposal')} variant="secondary">
            New Proposal
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={UserGroupIcon}
          title="You are not part of any group yet"
          description="Create a group first to start a project proposal, or ask a leader to add you."
          action={{ label: 'Create Group', onClick: () => setIsCreateModalOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <Card
              key={group._id}
              title={group.groupName}
              description={`${group.members?.length || 0} members`}
              headerRight={
                <Badge status="pending">
                  {isGroupLeader(group, user.id) ? 'Leader' : 'Member'}
                </Badge>
              }
            >
              <div className="mb-4 grid gap-2">
                {group.members?.map((member) => (
                  <MemberAvatar key={getMemberId(member)} member={member} />
                ))}
              </div>
              <div className="flex justify-end gap-2">
                {isGroupLeader(group, user.id) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={UserPlusIcon}
                    onClick={() => setAddMemberModal({ open: true, groupId: group._id })}
                  >
                    Add Member
                  </Button>
                )}
                <Button size="sm" onClick={() => navigate(`/student/groups/${group._id}`)}>
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateGroupModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
        loading={createLoading}
      />

      <AddMemberModal
        open={addMemberModal.open}
        onClose={() => setAddMemberModal({ open: false, groupId: null })}
        onSubmit={handleAddMember}
        loading={addMemberLoading}
      />
    </div>
  );
}
