const Group = require('../models/Group');

// Ensures the authenticated user is the leader of the group (or admin)
module.exports = async function isGroupLeader(req, res, next) {
  try {
    const groupId = req.params.id || req.params.groupId || req.body.groupId;

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Admin bypass
    if (req.user.role === 'admin') {
      req.group = group;
      return next();
    }

    const member = group.members.find(
      (m) => m.studentId.toString() === req.user.id
    );

    if (!member) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    if (member.role !== 'leader') {
      return res.status(403).json({ message: 'Only group leader can perform this action' });
    }

    req.group = group;
    next();
  } catch (error) {
    next(error);
  }
};
