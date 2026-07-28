const router = require('express').Router();
const { getAllBlogsAdmin, createBlog, updateBlog, deleteBlog } = require('../../controllers/blog.controller');

router.get('/', getAllBlogsAdmin);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;
