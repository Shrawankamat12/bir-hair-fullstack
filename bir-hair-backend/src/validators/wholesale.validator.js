const { body } = require('express-validator');

exports.submitWholesaleRules = [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('contactName').trim().notEmpty().withMessage('Contact name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
];
