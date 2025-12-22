const Group = require('../models/Group');

// Middleware to verify user is group leader or admin
const isGroupLeader = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    
    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    // Admin can perform any action
    if (req.user.role === 'admin') {
      // Fetch and attach group for potential use in controller
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      req.group = group;
      return next();
    }

    // Find the group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member and has leader role
    const member = group.members.find(
      m => m.studentId.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ 
        message: 'You are not a member of this group' 
      });
    }

    if (member.role !== 'leader') {
      return res.status(403).json({ 
        message: 'Only group leader can perform this action' 
      });
    }

    // Attach group to request for use in controller
    req.group = group;
    next();
  } catch (error) {
    console.error('isGroupLeader middleware error:', error);
    res.status(500).json({ message: 'Server error in authorization check' });
  }
};

module.exports = isGroupLeader;
