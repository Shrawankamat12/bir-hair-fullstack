const { body } = require('express-validator');

exports.addToCartRules = [
  body('productId').isMongoId().withMessage('Valid product id is required'),
  body('qty').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

exports.updateCartItemRules = [body('qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1')];
