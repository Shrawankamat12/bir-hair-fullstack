const router = require('express').Router();
const { getBlogs, getBlog } = require('../controllers/blog.controller');

router.get('/', getBlogs);
router.get('/:slug', getBlog);

module.exports = router;
