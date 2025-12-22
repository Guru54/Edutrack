const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  verifyUser,
  createGroup,
  getGroup,
  updateGroup,
  getUserGroups,
  getGuides
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

// User routes
router.get('/users', protect, authorize('admin'), getUsers);
router.get('/users/:id', protect, getUser);
router.put('/users/:id', protect, updateUser);
router.put('/users/:id/verify', protect, authorize('admin'), verifyUser);
router.get('/users/:id/groups', protect, getUserGroups);

// Group routes
router.post('/groups', protect, authorize('student'), createGroup);
router.get('/groups/:id', protect, getGroup);
router.put('/groups/:id', protect, updateGroup);

// Guides route
router.get('/guides', protect, getGuides);

module.exports = router;
