const router = require('express').Router();
const { getSubCategories, getSubCategory } = require('../controllers/subcategory.controller');

router.get('/', getSubCategories);
router.get('/:id', getSubCategory);

module.exports = router;
