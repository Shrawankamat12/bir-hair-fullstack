const asyncHandler = require('express-async-handler');
const blogService = require('../services/blog.service');

exports.getBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogService.listPublic(req.query.category);
  res.json({ success: true, data: blogs });
});

exports.getBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.getBySlug(req.params.slug);
  res.json({ success: true, data: blog });
});

exports.getAllBlogsAdmin = asyncHandler(async (req, res) => {
  const blogs = await blogService.listAll();
  res.json({ success: true, data: blogs });
});

exports.createBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.create(req.body);
  res.status(201).json({ success: true, data: blog });
});

exports.updateBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.updateById(req.params.id, req.body);
  res.json({ success: true, data: blog });
});

exports.deleteBlog = asyncHandler(async (req, res) => {
  await blogService.deleteById(req.params.id);
  res.json({ success: true, message: 'Blog deleted' });
});
