const User = require('../models/User');
const Group = require('../models/Group');

// @desc    Get all users (with role filter)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, isVerified } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    const users = await User.find(filter).select('-password');

    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res, next) => {
  try {
    // Users can only update their own profile unless admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    // Don't allow updating password or role through this route
    const { password, role, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify/approve user (for faculty/admin accounts)
// @route   PUT /api/users/:id/verify
// @access  Private (Admin)
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      message: 'User verified successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student group
// @route   POST /api/groups
// @access  Private (Student)
const createGroup = async (req, res, next) => {
  try {
    const { groupName, members } = req.body;

    // Validate members are students
    const memberIds = members.map(m => m.studentId);
    const users = await User.find({ _id: { $in: memberIds }, role: 'student' });

    if (users.length !== memberIds.length) {
      return res.status(400).json({ message: 'All members must be valid students' });
    }

    // Check if any member is already in a group for the same project type
    const existingGroups = await Group.find({
      'members.studentId': { $in: memberIds }
    });

    if (existingGroups.length > 0) {
      return res.status(400).json({ 
        message: 'One or more members are already in a group' 
      });
    }

    const group = await Group.create({
      groupName,
      members
    });

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private
const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.studentId', 'fullName email department');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ group });
  } catch (error) {
    next(error);
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (Student - group member)
const updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member of the group
    const isMember = group.members.some(member => member.studentId.toString() === req.user.id);
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this group' });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('members.studentId', 'fullName email department');

    res.json({
      message: 'Group updated successfully',
      group: updatedGroup
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's groups
// @route   GET /api/users/:id/groups
// @access  Private
const getUserGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ 'members.studentId': req.params.id })
      .populate('members.studentId', 'fullName email');

    res.json({
      count: groups.length,
      groups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all faculty guides
// @route   GET /api/guides
// @access  Private
const getGuides = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    
    const guides = await User.find(
      { role: 'faculty', isVerified: true },
      { password: 0, verificationToken: 0 }
    ).sort({ fullName: 1 });
    
    // Get workload for each guide
    const guidesWithWorkload = await Promise.all(
      guides.map(async (guide) => {
        const projectCount = await Project.countDocuments({
          guideId: guide._id,
          status: { $in: ['approved', 'in_progress'] }
        });
        
        return {
          _id: guide._id,
          fullName: guide.fullName,
          department: guide.department,
          email: guide.email,
          currentProjects: projectCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: guidesWithWorkload
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  verifyUser,
  createGroup,
  getGroup,
  updateGroup,
  getUserGroups,
  getGuides
};
