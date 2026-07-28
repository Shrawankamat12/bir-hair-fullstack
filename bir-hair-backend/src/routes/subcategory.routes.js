const router = require('express').Router();
const { getSubCategories } = require('../controllers/subcategory.controller');

router.get('/', getSubCategories);

module.exports = router;
