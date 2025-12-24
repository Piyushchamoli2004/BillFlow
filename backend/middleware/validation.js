const { body, validationResult } = require('express-validator');

// Validation middleware handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Registration validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage('Invalid phone number format'),
  
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Organization name too long')
];

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Password reset request validation
const passwordResetRequestValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Password reset validation
const passwordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('resetCode')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Reset code must be a 6-digit number'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
];

// Tenant validation rules
const tenantValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tenant name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Tenant name must be between 2 and 255 characters'),
  
  body('room')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Room number too long'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage('Invalid phone number format'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('rentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Rent amount must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'moved-out'])
    .withMessage('Invalid status value')
];

// Bill validation rules
const billValidation = [
  body('billNumber')
    .trim()
    .notEmpty()
    .withMessage('Bill number is required'),
  
  body('tenantName')
    .trim()
    .notEmpty()
    .withMessage('Tenant name is required'),
  
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  
  body('rentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Rent amount must be a positive number'),
  
  body('electricityAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Electricity amount must be a positive number'),
  
  body('waterAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Water amount must be a positive number'),
  
  body('maintenanceAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maintenance amount must be a positive number'),
  
  body('otherCharges')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other charges must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['paid', 'unpaid', 'overdue', 'partial'])
    .withMessage('Invalid status value')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  passwordResetRequestValidation,
  passwordResetValidation,
  tenantValidation,
  billValidation
};
