const Milestone = require('../models/Milestone');
const Feedback = require('../models/Feedback');
const Project = require('../models/Project');
const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('../config/email');
const { feedbackReceivedEmail } = require('../utils/emailTemplates');

// @desc    Create milestone for project
// @route   POST /api/projects/:id/milestones
// @access  Private (Faculty, Admin)
const createMilestone = async (req, res, next) => {
  try {
    const { title, description, dueDate } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Faculty can only create milestones for their assigned projects
    if (req.user.role === 'faculty' && project.guideId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create milestones for this project' });
    }

    const milestone = await Milestone.create({
      projectId,
      title,
      description,
      dueDate,
      createdBy: req.user.id
    });

    // Notify group members
    const group = await Group.findById(project.groupId);
    for (const member of group.members) {
      await Notification.create({
        userId: member.studentId,
        message: `New milestone "${title}" created for project "${project.title}"`,
        type: 'info'
      });
    }

    res.status(201).json({
      message: 'Milestone created successfully',
      milestone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get milestones for project
// @route   GET /api/projects/:id/milestones
// @access  Private
const getMilestones = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    const milestones = await Milestone.find({ projectId })
      .populate('submittedBy', 'fullName email')
      .populate('createdBy', 'fullName')
      .sort({ dueDate: 1 });

    res.json({
      count: milestones.length,
      milestones
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private (Faculty, Admin)
const updateMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    const updatedMilestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Milestone updated successfully',
      milestone: updatedMilestone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit milestone
// @route   POST /api/milestones/:id/submit
// @access  Private (Student)
const submitMilestone = async (req, res, next) => {
  try {
    const { submissionText, fileIds } = req.body;
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Verify student is part of project group
    const project = await Project.findById(milestone.projectId);
    const group = await Group.findById(project.groupId);
    const isMember = group.members.some(member => member.studentId.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to submit this milestone' });
    }

    milestone.status = 'submitted';
    milestone.submissionDate = Date.now();
    milestone.submittedBy = req.user.id;
    milestone.submissionText = submissionText;
    if (fileIds) milestone.fileIds = fileIds;

    await milestone.save();

    // Notify guide
    if (project.guideId) {
      await Notification.create({
        userId: project.guideId,
        message: `New submission for milestone "${milestone.title}" in project "${project.title}"`,
        type: 'info'
      });
    }

    res.json({
      message: 'Milestone submitted successfully',
      milestone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Provide feedback on milestone
// @route   POST /api/milestones/:id/feedback
// @access  Private (Faculty, Admin)
const provideFeedback = async (req, res, next) => {
  try {
    const { feedbackText, marks, status } = req.body;
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Verify faculty is the guide for this project
    const project = await Project.findById(milestone.projectId).populate('groupId');
    if (req.user.role === 'faculty' && project.guideId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to provide feedback for this milestone' });
    }

    // Create feedback
    const feedback = await Feedback.create({
      milestoneId: milestone._id,
      givenBy: req.user.id,
      feedbackText,
      marks
    });

    // Update milestone status if provided
    if (status) {
      milestone.status = status;
      await milestone.save();
    }

    // Notify group members
    for (const member of project.groupId.members) {
      await Notification.create({
        userId: member.studentId,
        message: `New feedback received for milestone "${milestone.title}"`,
        type: 'success'
      });

      // Send email notification
      try {
        const student = await User.findById(member.studentId);
        await sendEmail({
          to: student.email,
          subject: 'New Feedback Received',
          html: feedbackReceivedEmail(student.fullName, milestone.title)
        });
      } catch (emailError) {
        console.error('Failed to send feedback email:', emailError);
      }
    }

    res.status(201).json({
      message: 'Feedback provided successfully',
      feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for milestone
// @route   GET /api/milestones/:id/feedback
// @access  Private
const getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ milestoneId: req.params.id })
      .populate('givenBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      count: feedback.length,
      feedback
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMilestone,
  getMilestones,
  updateMilestone,
  submitMilestone,
  provideFeedback,
  getFeedback
};
