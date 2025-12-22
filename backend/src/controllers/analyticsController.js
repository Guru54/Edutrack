const Project = require('../models/Project');
const User = require('../models/User');
const Milestone = require('../models/Milestone');
const { detectDuplicates } = require('../utils/duplicateDetector');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin)
const getDashboardAnalytics = async (req, res, next) => {
  try {
    // Project status distribution
    const statusStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Project type distribution
    const typeStats = await Project.aggregate([
      {
        $group: {
          _id: '$projectType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total counts
    const totalProjects = await Project.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty', isVerified: true });
    const pendingReviews = await Project.countDocuments({ status: 'proposed' });

    // Recent projects
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('groupId', 'groupName')
      .populate('guideId', 'fullName');

    res.json({
      overview: {
        totalProjects,
        totalStudents,
        totalFaculty,
        pendingReviews
      },
      statusDistribution: statusStats,
      typeDistribution: typeStats,
      recentProjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get guide workload analytics
// @route   GET /api/analytics/guide-workload
// @access  Private (Admin)
const getGuideWorkload = async (req, res, next) => {
  try {
    const workloadData = await Project.aggregate([
      {
        $match: {
          guideId: { $ne: null },
          status: { $in: ['approved', 'in_progress'] }
        }
      },
      {
        $group: {
          _id: '$guideId',
          projectCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'guide'
        }
      },
      {
        $unwind: '$guide'
      },
      {
        $project: {
          guideName: '$guide.fullName',
          department: '$guide.department',
          projectCount: 1
        }
      },
      {
        $sort: { projectCount: -1 }
      }
    ]);

    res.json({
      count: workloadData.length,
      workload: workloadData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project status analytics
// @route   GET /api/analytics/project-status
// @access  Private (Admin)
const getProjectStatus = async (req, res, next) => {
  try {
    const { academicYear, semester } = req.query;

    const filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const statusData = await Project.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            status: '$status',
            projectType: '$projectType'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.status',
          types: {
            $push: {
              type: '$_id.projectType',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      }
    ]);

    // Milestone completion rate
    const milestones = await Milestone.find();
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'approved').length;
    const completionRate = totalMilestones > 0 
      ? ((completedMilestones / totalMilestones) * 100).toFixed(2) 
      : 0;

    res.json({
      statusData,
      milestoneStats: {
        total: totalMilestones,
        completed: completedMilestones,
        completionRate: `${completionRate}%`
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get duplicate projects analytics
// @route   GET /api/analytics/duplicates
// @access  Private (Admin)
const getDuplicateProjects = async (req, res, next) => {
  try {
    const allProjects = await Project.find({ status: { $ne: 'rejected' } })
      .select('title description status groupId')
      .populate('groupId', 'groupName');

    const duplicateGroups = [];
    const checkedProjects = new Set();

    for (const project of allProjects) {
      if (checkedProjects.has(project._id.toString())) continue;

      const result = await detectDuplicates(
        project.title, 
        project.description, 
        project._id
      );

      if (result.isDuplicate) {
        checkedProjects.add(project._id.toString());
        result.similarProjects.forEach(sp => checkedProjects.add(sp.project.id.toString()));

        duplicateGroups.push({
          mainProject: {
            id: project._id,
            title: project.title,
            groupName: project.groupId?.groupName,
            status: project.status
          },
          similarProjects: result.similarProjects
        });
      }
    }

    res.json({
      count: duplicateGroups.length,
      duplicateGroups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delayed projects
// @route   GET /api/analytics/delayed
// @access  Private (Admin, Faculty)
const getDelayedProjects = async (req, res, next) => {
  try {
    const now = new Date();
    
    // Find milestones that are past due and not completed
    const delayedMilestones = await Milestone.find({
      dueDate: { $lt: now },
      status: { $in: ['pending', 'submitted'] }
    })
      .populate({
        path: 'projectId',
        populate: [
          { path: 'groupId', select: 'groupName' },
          { path: 'guideId', select: 'fullName' }
        ]
      });

    // Group by project
    const projectMap = new Map();
    
    delayedMilestones.forEach(milestone => {
      if (milestone.projectId) {
        const projectId = milestone.projectId._id.toString();
        if (!projectMap.has(projectId)) {
          projectMap.set(projectId, {
            project: milestone.projectId,
            delayedMilestones: []
          });
        }
        projectMap.get(projectId).delayedMilestones.push({
          id: milestone._id,
          title: milestone.title,
          dueDate: milestone.dueDate,
          status: milestone.status,
          daysDelayed: Math.floor((now - milestone.dueDate) / (1000 * 60 * 60 * 24))
        });
      }
    });

    const delayedProjects = Array.from(projectMap.values());

    res.json({
      count: delayedProjects.length,
      delayedProjects
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getGuideWorkload,
  getProjectStatus,
  getDuplicateProjects,
  getDelayedProjects
};
