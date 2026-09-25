const router = require('express').Router();

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} = require('../controllers/category.controller');

// Get all categories
router.get('/', getCategories);

// Create category
router.post('/', createCategory);

// Get single category
router.get('/:id', getCategoryById);

// Update category
router.put('/:id', updateCategory);

// Delete category
router.delete('/:id', deleteCategory);

module.exports = router;