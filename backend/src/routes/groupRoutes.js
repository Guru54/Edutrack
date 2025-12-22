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

// Create group (students only)
router.post('/', protect, authorize('student'), createGroup);

// Get group details (authenticated users)
router.get('/:id', protect, getGroup);

// Add member (leader or admin)
router.post('/:id/add-member', protect, isGroupLeader, addMember);

// Remove member (leader or admin)
router.post('/:id/remove-member', protect, isGroupLeader, removeMember);

// Leave group (members)
router.post('/:id/leave', protect, leaveGroup);

// Transfer leadership (leader or admin)
router.patch('/:id/transfer-leader', protect, isGroupLeader, transferLeader);

// Request leadership transfer (members)
router.post('/:id/request-transfer', protect, requestTransfer);

module.exports = router;
