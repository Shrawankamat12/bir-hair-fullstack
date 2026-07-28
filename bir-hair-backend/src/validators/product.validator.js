const { body } = require('express-validator');

exports.createProductRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('category').isMongoId().withMessage('Valid category is required'),
  body('mrp').isFloat({ min: 0 }).withMessage('MRP must be a positive number'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('images').optional().isArray().withMessage('Images must be an array of URLs'),
];

exports.updateProductRules = [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('category').optional().isMongoId().withMessage('Valid category is required'),
  body('mrp').optional().isFloat({ min: 0 }).withMessage('MRP must be a positive number'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];
