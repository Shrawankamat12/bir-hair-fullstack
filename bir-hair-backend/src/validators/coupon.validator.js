const { body } = require('express-validator');

exports.applyCouponRules = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
];

exports.createCouponRules = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('type').optional().isIn(['percentage', 'flat']).withMessage('Invalid coupon type'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
];
