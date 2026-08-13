const { body } = require('express-validator');

exports.registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .customSanitizer((v) =>
      v.toLowerCase()
    ),

  body('phone')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Phone must be a string'),

  body('password')
    .isLength({ min: 8 })
    .withMessage(
      'Password must be at least 8 characters'
    ),
];

exports.loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .customSanitizer((v) =>
      v.toLowerCase()
    ),

  body('password')
    .notEmpty()
    .withMessage(
      'Password is required'
    ),
];

exports.forgotPasswordRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage(
      'Valid email is required'
    )
    .customSanitizer((v) =>
      v.toLowerCase()
    ),
];

exports.resetPasswordRules = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage(
      'Reset token is required'
    ),

  body('password')
    .isLength({ min: 8 })
    .withMessage(
      'Password must be at least 8 characters'
    ),
];

exports.changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage(
      'Current password is required'
    ),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage(
      'New password must be at least 8 characters'
    ),
];