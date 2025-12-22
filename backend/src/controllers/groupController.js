const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create new group
// @route   POST /api/groups
// @access  Private (Student)
const createGroup = async (req, res, next) => {
  try {
    const { groupName, members } = req.body;

    if (!groupName) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    // Check if user already has a group
    const existingGroup = await Group.findOne({
      'members.studentId': req.user._id
    });

    if (existingGroup) {
      return res.status(400).json({ 
        message: 'You are already part of a group. Leave your current group first.' 
      });
    }

    // Initialize members array with creator as leader
    let groupMembers = [{
      studentId: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: 'leader'
    }];

    // If additional members provided, validate and add them
    if (members && Array.isArray(members) && members.length > 0) {
      // Validate max 4 members total
      if (members.length + 1 > 4) {
        return res.status(400).json({ 
          message: 'Group cannot have more than 4 members' 
        });
      }

      // Validate each member
      for (const memberData of members) {
        const { studentId } = memberData;
        
        // Check if student exists and has student role
        const student = await User.findById(studentId);
        if (!student) {
          return res.status(404).json({ 
            message: `Student with ID ${studentId} not found` 
          });
        }

        if (student.role !== 'student') {
          return res.status(400).json({ 
            message: `User ${student.fullName} is not a student` 
          });
        }

        // Check if student is already in another group
        const studentInGroup = await Group.findOne({
          'members.studentId': studentId
        });

        if (studentInGroup) {
          return res.status(400).json({ 
            message: `${student.fullName} is already in another group` 
          });
        }

        groupMembers.push({
          studentId: student._id,
          fullName: student.fullName,
          email: student.email,
          role: 'member'
        });
      }
    }

    // Create group
    const group = await Group.create({
      groupName,
      members: groupMembers,
      createdBy: req.user._id
    });

    // Create notifications for added members
    for (const member of groupMembers) {
      if (member.studentId.toString() !== req.user._id.toString()) {
        try {
          await Notification.create({
            userId: member.studentId,
            message: `You have been added to group "${groupName}" by ${req.user.fullName}`,
            type: 'info'
          });
        } catch (notifError) {
          console.error('Failed to create notification:', notifError);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private (Member or Admin)
const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.studentId', 'fullName email department')
      .populate('createdBy', 'fullName email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member or admin
    const isMember = group.members.some(
      m => m.studentId._id.toString() === req.user._id.toString()
    );

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this group.' 
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/add-member
// @access  Private (Leader or Admin)
const addMember = async (req, res, next) => {
  try {
    const { studentId, email } = req.body;

    if (!studentId && !email) {
      return res.status(400).json({ 
        message: 'Student ID or email is required' 
      });
    }

    // Find student
    const query = studentId ? { _id: studentId } : { email };
    const student = await User.findOne(query);

    if (!student) {
      return res.status(404).json({ 
        message: 'Student not found' 
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ 
        message: 'User is not a student' 
      });
    }

    // Check if student is already in another group
    const studentInGroup = await Group.findOne({
      'members.studentId': student._id
    });

    if (studentInGroup) {
      if (studentInGroup._id.toString() === req.params.id) {
        return res.status(400).json({ 
          message: `${student.fullName} is already in this group` 
        });
      }
      return res.status(400).json({ 
        message: `${student.fullName} is already in another group` 
      });
    }

    // Use atomic update to add member with validations
    const group = await Group.findOneAndUpdate(
      {
        _id: req.params.id,
        'members.studentId': { $ne: student._id }, // Ensure not already member
        $expr: { $lt: [{ $size: '$members' }, 4] } // Ensure less than 4 members
      },
      {
        $push: {
          members: {
            studentId: student._id,
            fullName: student.fullName,
            email: student.email,
            role: 'member'
          }
        }
      },
      { new: true, runValidators: true }
    ).populate('members.studentId', 'fullName email department');

    if (!group) {
      return res.status(400).json({ 
        message: 'Cannot add member. Group may be full or student is already a member.' 
      });
    }

    // Create notification for new member
    try {
      await Notification.create({
        userId: student._id,
        message: `You have been added to group "${group.groupName}" by ${req.user.fullName}`,
        type: 'info'
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Member added successfully',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from group
// @route   POST /api/groups/:id/remove-member
// @access  Private (Leader or Admin)
const removeMember = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const group = req.group; // Attached by middleware

    // Check if trying to remove leader
    const memberToRemove = group.members.find(
      m => m.studentId.toString() === studentId
    );

    if (!memberToRemove) {
      return res.status(404).json({ 
        message: 'Student is not a member of this group' 
      });
    }

    if (memberToRemove.role === 'leader') {
      return res.status(400).json({ 
        message: 'Cannot remove leader. Transfer leadership first.' 
      });
    }

    // Remove member
    group.members = group.members.filter(
      m => m.studentId.toString() !== studentId
    );

    await group.save();

    // Create notification
    try {
      await Notification.create({
        userId: studentId,
        message: `You have been removed from group "${group.groupName}"`,
        type: 'warning'
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave group
// @route   POST /api/groups/:id/leave
// @access  Private (Member)
const leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member
    const member = group.members.find(
      m => m.studentId.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(400).json({ 
        message: 'You are not a member of this group' 
      });
    }

    // Check if user is leader
    if (member.role === 'leader') {
      return res.status(400).json({ 
        message: 'Leader cannot leave the group. Transfer leadership first or delete the group.' 
      });
    }

    // Remove member
    group.members = group.members.filter(
      m => m.studentId.toString() !== req.user._id.toString()
    );

    await group.save();

    res.json({
      success: true,
      message: 'You have left the group successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer leadership
// @route   PATCH /api/groups/:id/transfer-leader
// @access  Private (Leader or Admin)
const transferLeader = async (req, res, next) => {
  try {
    const { newLeaderId } = req.body;

    if (!newLeaderId) {
      return res.status(400).json({ message: 'New leader ID is required' });
    }

    const group = req.group; // Attached by middleware

    // Check if new leader is a member
    const newLeaderMember = group.members.find(
      m => m.studentId.toString() === newLeaderId
    );

    if (!newLeaderMember) {
      return res.status(404).json({ 
        message: 'New leader is not a member of this group' 
      });
    }

    // Find current leader
    const currentLeader = group.members.find(m => m.role === 'leader');

    // Update roles
    group.members = group.members.map(m => {
      if (m.studentId.toString() === newLeaderId) {
        return { ...m.toObject(), role: 'leader' };
      }
      if (m.role === 'leader') {
        return { ...m.toObject(), role: 'member' };
      }
      return m;
    });

    await group.save();

    // Create notifications
    try {
      await Notification.create({
        userId: newLeaderId,
        message: `You are now the leader of group "${group.groupName}"`,
        type: 'success'
      });

      if (currentLeader) {
        await Notification.create({
          userId: currentLeader.studentId,
          message: `Leadership of group "${group.groupName}" has been transferred to ${newLeaderMember.fullName}`,
          type: 'info'
        });
      }
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Leadership transferred successfully',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request leadership transfer
// @route   POST /api/groups/:id/request-transfer
// @access  Private (Member)
const requestTransfer = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member
    const member = group.members.find(
      m => m.studentId.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(400).json({ 
        message: 'You are not a member of this group' 
      });
    }

    if (member.role === 'leader') {
      return res.status(400).json({ 
        message: 'You are already the leader' 
      });
    }

    // Find leader
    const leader = group.members.find(m => m.role === 'leader');

    if (!leader) {
      return res.status(400).json({ message: 'Group has no leader' });
    }

    // Create notification for leader
    try {
      await Notification.create({
        userId: leader.studentId,
        message: `${req.user.fullName} has requested leadership of group "${group.groupName}"`,
        type: 'info'
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Leadership transfer request sent to current leader'
    });
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
