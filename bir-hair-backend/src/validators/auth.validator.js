const { body } = require('express-validator');

exports.registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').customSanitizer((v) => v.toLowerCase()),
  body('phone').optional({ checkFalsy: true }).isString(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').customSanitizer((v) => v.toLowerCase()),
  body('password').notEmpty().withMessage('Password is required'),
];
