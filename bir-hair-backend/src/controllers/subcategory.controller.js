const asyncHandler = require('express-async-handler');
const subcategoryService = require('../services/subcategory.service');

exports.getSubCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;
  const data = await subcategoryService.listAll(filter);
  res.json({ success: true, data });
});

exports.getSubCategory = asyncHandler(async (req, res) => {
  const data = await subcategoryService.getById(req.params.id);
  res.json({ success: true, data });
});

exports.createSubCategory = asyncHandler(async (req, res) => {
  const data = await subcategoryService.create(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateSubCategory = asyncHandler(async (req, res) => {
  const data = await subcategoryService.updateById(req.params.id, req.body);
  res.json({ success: true, data });
});

exports.deleteSubCategory = asyncHandler(async (req, res) => {
  await subcategoryService.deleteById(req.params.id);
  res.json({ success: true, message: 'Sub-category deleted' });
});
