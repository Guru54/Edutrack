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
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validate group size (2-4 members)
groupSchema.pre('save', function(next) {
  if (this.members.length < 2 || this.members.length > 4) {
    return next(new Error('Group must have 2-4 members'));
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);
