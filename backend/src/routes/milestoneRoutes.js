const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access project ID
const {
  createMilestone,
  getMilestones,
  updateMilestone,
  submitMilestone,
  provideFeedback,
  getFeedback
} = require('../controllers/milestoneController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const { milestoneValidation, validate } = require('../utils/validators');

// Routes for /api/projects/:id/milestones
router.route('/')
  .get(protect, getMilestones)
  .post(protect, authorize('faculty', 'admin'), milestoneValidation, validate, createMilestone);

// Routes for /api/milestones/:id
router.put('/:id', protect, authorize('faculty', 'admin'), updateMilestone);
router.post('/:id/submit', protect, authorize('student'), submitMilestone);
router.post('/:id/feedback', protect, authorize('faculty', 'admin'), provideFeedback);
router.get('/:id/feedback', protect, getFeedback);

module.exports = router;
