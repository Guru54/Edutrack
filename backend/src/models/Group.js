const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  members: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validate group size (1-4 members)
groupSchema.pre('save', function(next) {
  if (this.members.length < 1 || this.members.length > 4) {
    return next(new Error('Group must have 1-4 members'));
  }
  
  // Ensure there's exactly one leader
  const leaders = this.members.filter(m => m.role === 'leader');
  if (leaders.length !== 1) {
    return next(new Error('Group must have exactly one leader'));
  }
  
  next();
});

module.exports = mongoose.model('Group', groupSchema);
