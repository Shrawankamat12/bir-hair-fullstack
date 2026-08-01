const asyncHandler = require('express-async-handler');
const categoryService = require('../services/category.service');

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listAll();
  res.json({ success: true, data: categories });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.body);
  res.status(201).json({ success: true, data: category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateById(req.params.id, req.body);
  res.json({ success: true, data: category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteById(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});
exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ success: true, data: category });
});
