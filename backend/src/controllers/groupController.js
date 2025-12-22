const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');

const buildMember = (user, role = 'member') => ({
  studentId: user._id,
  fullName: user.fullName,
  email: user.email,
  role
});

// Create a new group with the requester as leader
const createGroup = async (req, res, next) => {
  try {
    const { groupName, memberIds = [], members = [] } = req.body;
    const additionalMembers = memberIds.length ? memberIds : members.map((m) => m.studentId).filter(Boolean);

    const uniqueMemberIds = Array.from(new Set([req.user.id, ...additionalMembers.map(String)]));

    if (uniqueMemberIds.length > 4) {
      return res.status(400).json({ message: 'Group must have 1-4 members' });
    }

    const users = await User.find({ _id: { $in: uniqueMemberIds }, role: 'student' });
    if (users.length !== uniqueMemberIds.length) {
      return res.status(400).json({ message: 'All members must be valid students' });
    }

    // Prevent duplicate memberships
    const existingGroup = await Group.findOne({ 'members.studentId': { $in: uniqueMemberIds } });
    if (existingGroup) {
      return res.status(400).json({ message: 'One or more members are already part of a group' });
    }

    const memberDocs = users.map((u) => buildMember(u, u._id.toString() === req.user.id ? 'leader' : 'member'));

    const group = await Group.create({
      groupName: groupName || `${users[0].fullName}'s Group`,
      members: memberDocs
    });

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    next(error);
  }
};

// Get group details (only members/admin)
const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some((m) => m.studentId.toString() === req.user.id);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this group' });
    }

    res.json({ group });
  } catch (error) {
    next(error);
  }
};

// Leader only: add member
const addMember = async (req, res, next) => {
  try {
    const group = req.group || (await Group.findById(req.params.id));
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.length >= 4) {
      return res.status(400).json({ message: 'Group already has maximum members (4)' });
    }

    const { studentId, email } = req.body;
    if (!studentId && !email) {
      return res.status(400).json({ message: 'Student identifier (email or ID) is required' });
    }
    const student = await User.findOne({
      ...(studentId ? { _id: studentId } : {}),
      ...(email ? { email } : {}),
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (group.members.some((m) => m.studentId.toString() === student._id.toString())) {
      return res.status(400).json({ message: 'Student already in group' });
    }

    group.members.push(buildMember(student, 'member'));
    await group.save();

    await Notification.create({
      userId: student._id,
      message: `You were added to group "${group.groupName}"`,
      type: 'info'
    });

    res.json({ message: 'Member added', group });
  } catch (error) {
    next(error);
  }
};

// Leader only: remove member
const removeMember = async (req, res, next) => {
  try {
    const group = req.group || (await Group.findById(req.params.id));
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { studentId } = req.body;
    const member = group.members.find((m) => m.studentId.toString() === studentId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found in group' });
    }

    if (member.role === 'leader') {
      return res.status(400).json({ message: 'Transfer leadership before removing the leader' });
    }

    group.members = group.members.filter((m) => m.studentId.toString() !== studentId);

    if (group.members.length === 0) {
      await group.deleteOne();
      return res.json({ message: 'Member removed and group deleted as it became empty' });
    }

    await group.save();

    await Notification.create({
      userId: member.studentId,
      message: `You were removed from group "${group.groupName}"`,
      type: 'warning'
    });

    res.json({ message: 'Member removed', group });
  } catch (error) {
    next(error);
  }
};

// Member leaves a group
const leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const member = group.members.find((m) => m.studentId.toString() === req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    if (member.role === 'leader' && group.members.length > 1) {
      return res.status(400).json({ message: 'Transfer leadership before leaving the group' });
    }

    group.members = group.members.filter((m) => m.studentId.toString() !== req.user.id);

    if (group.members.length === 0) {
      await group.deleteOne();
      return res.json({ message: 'You left the group. Group deleted as it has no members.' });
    }

    await group.save();

    res.json({ message: 'Left group successfully', group });
  } catch (error) {
    next(error);
  }
};

// Leader/Admin: transfer leadership
const transferLeader = async (req, res, next) => {
  try {
    const { newLeaderId } = req.body;
    const group = req.group || (await Group.findById(req.params.id));

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const target = group.members.find((m) => m.studentId.toString() === newLeaderId);
    if (!target) {
      return res.status(404).json({ message: 'Target member not found in group' });
    }

    group.members = group.members.map((m) => {
      if (m.studentId.toString() === newLeaderId) {
        m.role = 'leader';
      } else if (m.role === 'leader') {
        m.role = 'member';
      }
      return m;
    });

    await group.save();

    await Notification.create({
      userId: target.studentId,
      message: `You have been made leader of group "${group.groupName}"`,
      type: 'success'
    });

    res.json({ message: 'Leadership transferred', group });
  } catch (error) {
    next(error);
  }
};

// Member: request leader change (notification only)
const requestTransfer = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const leader = group.members.find((m) => m.role === 'leader');
    const requester = group.members.find((m) => m.studentId.toString() === req.user.id);

    if (!requester) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    if (leader) {
      await Notification.create({
        userId: leader.studentId,
        message: `${requester.fullName} requested leadership transfer for group "${group.groupName}"`,
        type: 'info'
      });
    }

    res.json({ message: 'Leadership transfer request sent' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  getGroup,
  addMember,
  removeMember,
  leaveGroup,
  transferLeader,
  requestTransfer
};
