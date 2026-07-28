const { body } = require('express-validator');

exports.createReviewRules = [
  body('productId').isMongoId().withMessage('Valid product id is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 2000 }).withMessage('Comment is too long'),
];
