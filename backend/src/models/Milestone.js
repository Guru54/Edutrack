const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Milestone description is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'needs_revision'],
    default: 'pending'
  },
  submissionDate: {
    type: Date
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submissionText: {
    type: String
  },
  fileIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Milestone', milestoneSchema);
