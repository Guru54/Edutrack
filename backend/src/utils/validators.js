const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role')
];

// Validation rules for login
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Validation rules for project creation
const projectValidation = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('description').trim().notEmpty().withMessage('Project description is required'),
  body('groupId').isMongoId().withMessage('Valid group ID is required'),
  body('projectType').isIn(['minor', 'major']).withMessage('Project type must be minor or major'),
  body('objectives').trim().notEmpty().withMessage('Project objectives are required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('semester').trim().notEmpty().withMessage('Semester is required')
];

// Validation rules for milestone creation
const milestoneValidation = [
  body('title').trim().notEmpty().withMessage('Milestone title is required'),
  body('description').trim().notEmpty().withMessage('Milestone description is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  projectValidation,
  milestoneValidation,
  validate
};
