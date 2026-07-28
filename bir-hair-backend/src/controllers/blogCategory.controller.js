const asyncHandler = require('express-async-handler');
const blogCategoryService = require('../services/blogCategory.service');

exports.getBlogCategories = asyncHandler(async (req, res) => {
  const data = await blogCategoryService.listAll();
  res.json({ success: true, data });
});

exports.createBlogCategory = asyncHandler(async (req, res) => {
  const data = await blogCategoryService.create(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateBlogCategory = asyncHandler(async (req, res) => {
  const data = await blogCategoryService.updateById(req.params.id, req.body);
  res.json({ success: true, data });
});

exports.deleteBlogCategory = asyncHandler(async (req, res) => {
  await blogCategoryService.deleteById(req.params.id);
  res.json({ success: true, message: 'Blog category deleted' });
});
