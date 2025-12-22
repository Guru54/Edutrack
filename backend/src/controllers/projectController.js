const Project = require('../models/Project');
const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { detectDuplicates } = require('../utils/duplicateDetector');
const { sendEmail } = require('../config/email');
const { proposalApprovedEmail, proposalRejectedEmail } = require('../utils/emailTemplates');

// @desc    Create new project proposal
// @route   POST /api/projects
// @access  Private (Student)
const createProject = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      groupId, 
      projectType, 
      technologyStack, 
      objectives, 
      academicYear, 
      semester,
      guideId,
      expectedOutcomes
    } = req.body;

    // If groupId is provided, verify group exists and user is part of it
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      const member = group.members.find(m => m.studentId.toString() === req.user.id);
      if (!member) {
        return res.status(403).json({ message: 'You are not a member of this group' });
      }

      // Only leader or admin can submit project for group
      if (req.user.role !== 'admin' && member.role !== 'leader') {
        return res.status(403).json({ 
          message: 'Only the group leader can submit a project proposal' 
        });
      }
    } else {
      // If no groupId, try to find user's group
      const group = await Group.findOne({
        'members.studentId': req.user.id
      });
      
      if (group) {
        req.body.groupId = group._id;
        
        // Verify user is leader of found group
        const member = group.members.find(m => m.studentId.toString() === req.user.id);
        if (req.user.role !== 'admin' && member.role !== 'leader') {
          return res.status(403).json({ 
            message: 'Only the group leader can submit a project proposal' 
          });
        }
      }
    }

    // Check for duplicates
    const duplicateCheck = await detectDuplicates(title, description);
    
    // Parse technologyStack if it's a string
    let techStack = technologyStack;
    if (typeof technologyStack === 'string') {
      techStack = technologyStack.split(',').map(t => t.trim());
    }
    
    // Create project
    const project = await Project.create({
      title,
      description,
      groupId: req.body.groupId || null,
      submittedBy: req.user.id,
      projectType: projectType.toLowerCase(), // Convert to lowercase for enum
      technologyStack: techStack,
      objectives,
      academicYear,
      semester,
      guideId: guideId || null,
      expectedOutcomes: expectedOutcomes || null,
      status: 'proposed',
      submissionDate: new Date()
    });

    // Create file record if uploaded
    if (req.file) {
      const File = require('../models/File');
      await File.create({
        uploadedBy: req.user.id,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        projectId: project._id
      });
    }

    // Send notification to guide if assigned
    if (guideId) {
      await Notification.create({
        userId: guideId,
        message: `New project proposal "${title}" submitted by ${req.user.fullName}`,
        type: 'info'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Project proposal created successfully',
      data: project,
      duplicateWarning: duplicateCheck.isDuplicate ? {
        message: 'Similar projects found',
        similarProjects: duplicateCheck.similarProjects
      } : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects (with filters)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { status, projectType, academicYear, semester, guideId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (projectType) filter.projectType = projectType;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    if (guideId) filter.guideId = guideId;

    // Role-based filtering
    if (req.user.role === 'student') {
      // Students see only their group's projects
      const groups = await Group.find({ 'members.studentId': req.user.id });
      const groupIds = groups.map(g => g._id);
      filter.groupId = { $in: groupIds };
    } else if (req.user.role === 'faculty') {
      // Faculty see their assigned projects
      filter.guideId = req.user.id;
    }
    // Admin sees all projects

    const projects = await Project.find(filter)
      .populate('groupId', 'groupName members')
      .populate('guideId', 'fullName email department')
      .sort({ createdAt: -1 });

    res.json({
      count: projects.length,
      projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('groupId')
      .populate('guideId', 'fullName email department');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only allow updates by group members or admin
    if (req.user.role === 'student') {
      const group = await Group.findById(project.groupId);
      const isMember = group.members.some(member => member.studentId.toString() === req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: 'Not authorized to update this project' });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve project proposal
// @route   POST /api/projects/:id/approve
// @access  Private (Faculty, Admin)
const approveProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('groupId');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Faculty can only approve their assigned projects
    if (req.user.role === 'faculty' && project.guideId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to approve this project' });
    }

    project.status = 'approved';
    project.approvalDate = Date.now();
    await project.save();

    // Create notifications for group members
    for (const member of project.groupId.members) {
      await Notification.create({
        userId: member.studentId,
        message: `Your project "${project.title}" has been approved!`,
        type: 'success'
      });

      // Send email notification
      try {
        const student = await User.findById(member.studentId);
        await sendEmail({
          to: student.email,
          subject: 'Project Proposal Approved',
          html: proposalApprovedEmail(student.fullName, project.title)
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }
    }

    res.json({
      message: 'Project approved successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject project proposal
// @route   POST /api/projects/:id/reject
// @access  Private (Faculty, Admin)
const rejectProject = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const project = await Project.findById(req.params.id).populate('groupId');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Faculty can only reject their assigned projects
    if (req.user.role === 'faculty' && project.guideId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this project' });
    }

    project.status = 'rejected';
    project.rejectionReason = reason || 'No reason provided';
    await project.save();

    // Create notifications for group members
    for (const member of project.groupId.members) {
      await Notification.create({
        userId: member.studentId,
        message: `Your project "${project.title}" requires revision. Reason: ${project.rejectionReason}`,
        type: 'warning'
      });

      // Send email notification
      try {
        const student = await User.findById(member.studentId);
        await sendEmail({
          to: student.email,
          subject: 'Project Proposal Requires Revision',
          html: proposalRejectedEmail(student.fullName, project.title, project.rejectionReason)
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }
    }

    res.json({
      message: 'Project marked for revision',
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check for duplicate projects
// @route   GET /api/projects/duplicates
// @access  Private
const checkDuplicates = async (req, res, next) => {
  try {
    const { title, description, excludeId } = req.query;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const result = await detectDuplicates(title, description, excludeId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  approveProject,
  rejectProject,
  checkDuplicates
};
