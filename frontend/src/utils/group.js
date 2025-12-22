export const getMemberId = (member) =>
  typeof member.studentId === 'string' ? member.studentId : member.studentId?._id;

export const isGroupLeader = (group, userId) => {
  if (!group || !userId) return false;
  return group.members?.some((member) => {
    const id = getMemberId(member);
    return member.role === 'leader' && id === userId;
  });
};
