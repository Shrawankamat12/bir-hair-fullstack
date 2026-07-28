const router = require('express').Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../../controllers/category.controller');
const validate = require('../../middleware/validate.middleware');
const { createCategoryRules, updateCategoryRules } = require('../../validators/category.validator');

router.get('/', getCategories);
router.post('/', createCategoryRules, validate, createCategory);
router.put('/:id', updateCategoryRules, validate, updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
