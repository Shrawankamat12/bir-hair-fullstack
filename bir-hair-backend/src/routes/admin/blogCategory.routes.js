const router = require('express').Router();
const { getBlogCategories, createBlogCategory, updateBlogCategory, deleteBlogCategory } = require('../../controllers/blogCategory.controller');

router.get('/', getBlogCategories);
router.post('/', createBlogCategory);
router.put('/:id', updateBlogCategory);
router.delete('/:id', deleteBlogCategory);

module.exports = router;
