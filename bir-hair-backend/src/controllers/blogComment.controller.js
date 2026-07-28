const asyncHandler = require('express-async-handler');
const blogCommentService = require('../services/blogComment.service');

exports.getBlogComments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const data = await blogCommentService.listAll(filter);
  res.json({ success: true, data });
});

exports.updateBlogComment = asyncHandler(async (req, res) => {
  const data = await blogCommentService.updateById(req.params.id, req.body);
  res.json({ success: true, data });
});

exports.deleteBlogComment = asyncHandler(async (req, res) => {
  await blogCommentService.deleteById(req.params.id);
  res.json({ success: true, message: 'Comment deleted' });
});
