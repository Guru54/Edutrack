const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  approveProject,
  rejectProject,
  checkDuplicates
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const { projectValidation, validate } = require('../utils/validators');
const { uploadProposal } = require('../middleware/upload');

// Duplicate check route (before :id routes to avoid conflict)
router.get('/duplicates', protect, checkDuplicates);

router.route('/')
  .get(protect, getProjects)
  .post(
    protect, 
    authorize('student'), 
    uploadProposal.single('proposalDocument'),
    createProject
  );

router.route('/:id')
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, authorize('admin'), deleteProject);

router.post('/:id/approve', protect, authorize('faculty', 'admin'), approveProject);
router.post('/:id/reject', protect, authorize('faculty', 'admin'), rejectProject);

module.exports = router;
