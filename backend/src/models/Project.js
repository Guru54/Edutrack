const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required']
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group ID is required']
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  projectType: {
    type: String,
    enum: ['minor', 'major'],
    required: [true, 'Project type is required']
  },
  technologyStack: [{
    type: String,
    trim: true
  }],
  objectives: {
    type: String,
    required: [true, 'Project objectives are required']
  },
  expectedOutcomes: {
    type: String
  },
  status: {
    type: String,
    enum: ['proposed', 'approved', 'in_progress', 'completed', 'rejected'],
    default: 'proposed'
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  semester: {
    type: String,
    required: [true, 'Semester is required']
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for duplicate detection
projectSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);
