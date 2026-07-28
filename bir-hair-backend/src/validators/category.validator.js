const { body } = require('express-validator');

exports.createCategoryRules = [body('name').trim().notEmpty().withMessage('Category name is required')];
exports.updateCategoryRules = [body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty')];
