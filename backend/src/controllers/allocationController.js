const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Group = require('../models/Group');

// @desc    Get available guides with workload
// @route   GET /api/guides
// @access  Private (Admin)
const getGuides = async (req, res, next) => {
  try {
    const guides = await User.find({ role: 'faculty', isVerified: true })
      .select('fullName email department');

    // Get workload for each guide
    const guidesWithWorkload = await Promise.all(
      guides.map(async (guide) => {
        const projectCount = await Project.countDocuments({ 
          guideId: guide._id,
          status: { $in: ['approved', 'in_progress'] }
        });

        return {
          id: guide._id,
          fullName: guide.fullName,
          email: guide.email,
          department: guide.department,
          projectCount
        };
      })
    );

    // Sort by workload (ascending)
    guidesWithWorkload.sort((a, b) => a.projectCount - b.projectCount);

    res.json({
      count: guidesWithWorkload.length,
      guides: guidesWithWorkload
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign guide to project
// @route   POST /api/allocations
// @access  Private (Admin)
const assignGuide = async (req, res, next) => {
  try {
    const { projectId, guideId } = req.body;

    const project = await Project.findById(projectId).populate('groupId');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const guide = await User.findById(guideId);
    if (!guide || guide.role !== 'faculty') {
      return res.status(404).json({ message: 'Guide not found' });
    }

    project.guideId = guideId;
    await project.save();

    // Notify guide
    await Notification.create({
      userId: guideId,
      message: `You have been assigned as guide for project "${project.title}"`,
      type: 'info'
    });

    // Notify group members
    const group = await Group.findById(project.groupId);
    for (const member of group.members) {
      await Notification.create({
        userId: member.studentId,
        message: `${guide.fullName} has been assigned as your project guide`,
        type: 'success'
      });
    }

    res.json({
      message: 'Guide assigned successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reassign guide to project
// @route   PUT /api/allocations/:id
// @access  Private (Admin)
const reassignGuide = async (req, res, next) => {
  try {
    const { guideId } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId).populate('groupId');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const guide = await User.findById(guideId);
    if (!guide || guide.role !== 'faculty') {
      return res.status(404).json({ message: 'Guide not found' });
    }

    const oldGuideId = project.guideId;
    project.guideId = guideId;
    await project.save();

    // Notify new guide
    await Notification.create({
      userId: guideId,
      message: `You have been assigned as guide for project "${project.title}"`,
      type: 'info'
    });

    // Notify old guide if exists
    if (oldGuideId) {
      await Notification.create({
        userId: oldGuideId,
        message: `You have been unassigned from project "${project.title}"`,
        type: 'warning'
      });
    }

    // Notify group members
    const group = await Group.findById(project.groupId);
    for (const member of group.members) {
      await Notification.create({
        userId: member.studentId,
        message: `Your project guide has been changed to ${guide.fullName}`,
        type: 'info'
      });
    }

    res.json({
      message: 'Guide reassigned successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get guide's workload/projects
// @route   GET /api/guides/:id/workload
// @access  Private
const getGuideWorkload = async (req, res, next) => {
  try {
    const guideId = req.params.id;

    // Verify guide exists
    const guide = await User.findById(guideId);
    if (!guide || guide.role !== 'faculty') {
      return res.status(404).json({ message: 'Guide not found' });
    }

    const projects = await Project.find({ guideId })
      .populate('groupId', 'groupName members')
      .sort({ createdAt: -1 });

    const stats = {
      total: projects.length,
      approved: projects.filter(p => p.status === 'approved').length,
      inProgress: projects.filter(p => p.status === 'in_progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
      proposed: projects.filter(p => p.status === 'proposed').length
    };

    res.json({
      guide: {
        id: guide._id,
        fullName: guide.fullName,
        email: guide.email,
        department: guide.department
      },
      stats,
      projects
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGuides,
  assignGuide,
  reassignGuide,
  getGuideWorkload
};
