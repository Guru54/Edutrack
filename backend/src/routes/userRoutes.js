const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  verifyUser,
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

// Guides route
router.get('/guides', protect, getGuides);

module.exports = router;
