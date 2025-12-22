import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { UserGroupIcon } from '@heroicons/react/24/outline';

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
  const { showError } = useNotification();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <Button onClick={() => navigate('/student/new-proposal')} variant="secondary">
          New Proposal
        </Button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={UserGroupIcon}
          title="You are not part of any group yet"
          description="Create a proposal as a leader to start a group, or ask your leader to add you."
          action={{ label: 'Create Proposal', onClick: () => navigate('/student/new-proposal') }}
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
                  {group.members?.find(
                    (m) =>
                      m.role === 'leader' &&
                      ((typeof m.studentId === 'string' && m.studentId === user.id) ||
                        m.studentId?._id === user.id)
                  )
                    ? 'Leader'
                    : 'Member'}
                </Badge>
              }
            >
              <div className="mb-4 grid gap-2">
                {group.members?.map((member) => (
                  <MemberAvatar
                    key={member.studentId?._id || member.studentId}
                    member={member}
                  />
                ))}
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => navigate(`/student/groups/${group._id}`)}>
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
