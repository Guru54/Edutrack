const express = require('express');
const router = express.Router();
const {
  assignGuide,
  reassignGuide,
  getGuideWorkload
} = require('../controllers/allocationController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.post('/allocations', protect, authorize('admin'), assignGuide);
router.put('/allocations/:id', protect, authorize('admin'), reassignGuide);
router.get('/guides/:id/workload', protect, getGuideWorkload);

module.exports = router;
