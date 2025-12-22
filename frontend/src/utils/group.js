export const isGroupLeader = (group, userId) => {
  if (!group || !userId) return false;
  return group.members?.some((member) => {
    const id = typeof member.studentId === 'string' ? member.studentId : member.studentId?._id;
    return member.role === 'leader' && id === userId;
  });
};
