const asyncHandler = require('express-async-handler');
const brandService = require('../services/brand.service');

exports.getBrands = asyncHandler(async (req, res) => {
  const data = await brandService.listAll();
  res.json({ success: true, data });
});

exports.getBrand = asyncHandler(async (req, res) => {
  const data = await brandService.getById(req.params.id);
  res.json({ success: true, data });
});

exports.createBrand = asyncHandler(async (req, res) => {
  const data = await brandService.create(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateBrand = asyncHandler(async (req, res) => {
  const data = await brandService.updateById(req.params.id, req.body);
  res.json({ success: true, data });
});

exports.deleteBrand = asyncHandler(async (req, res) => {
  await brandService.deleteById(req.params.id);
  res.json({ success: true, message: 'Brand deleted' });
});
