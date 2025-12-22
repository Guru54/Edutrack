const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const isGroupLeader = require('../middleware/isGroupLeader');
const {
  createGroup,
  getGroup,
  addMember,
  removeMember,
  leaveGroup,
  transferLeader,
  requestTransfer
} = require('../controllers/groupController');

// Create group
router.post('/', protect, authorize('student'), createGroup);

// Get details
router.get('/:id', protect, getGroup);

// Leader-only actions
router.post('/:id/add-member', protect, authorize('student', 'admin'), isGroupLeader, addMember);
router.post('/:id/remove-member', protect, authorize('student', 'admin'), isGroupLeader, removeMember);
router.patch('/:id/transfer-leader', protect, authorize('student', 'admin'), isGroupLeader, transferLeader);

// Member actions
router.post('/:id/leave', protect, authorize('student', 'admin'), leaveGroup);
router.post('/:id/request-transfer', protect, authorize('student', 'admin'), requestTransfer);

module.exports = router;
