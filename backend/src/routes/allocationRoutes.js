const express = require('express');
const router = express.Router();
const {
  getGuides,
  assignGuide,
  reassignGuide,
  getGuideWorkload
} = require('../controllers/allocationController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.get('/guides', protect, authorize('admin'), getGuides);
router.post('/allocations', protect, authorize('admin'), assignGuide);
router.put('/allocations/:id', protect, authorize('admin'), reassignGuide);
router.get('/guides/:id/workload', protect, getGuideWorkload);

module.exports = router;
