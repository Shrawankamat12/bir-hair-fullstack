const router = require('express').Router();
const { getBlogComments, updateBlogComment, deleteBlogComment } = require('../../controllers/blogComment.controller');

router.get('/', getBlogComments);
router.put('/:id', updateBlogComment);
router.delete('/:id', deleteBlogComment);

module.exports = router;
