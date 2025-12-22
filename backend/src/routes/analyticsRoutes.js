const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getGuideWorkload,
  getProjectStatus,
  getDuplicateProjects,
  getDelayedProjects
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.get('/dashboard', protect, authorize('admin'), getDashboardAnalytics);
router.get('/guide-workload', protect, authorize('admin'), getGuideWorkload);
router.get('/project-status', protect, authorize('admin', 'faculty'), getProjectStatus);
router.get('/duplicates', protect, authorize('admin'), getDuplicateProjects);
router.get('/delayed', protect, authorize('admin', 'faculty'), getDelayedProjects);

module.exports = router;
