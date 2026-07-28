const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');
const uploadService = require('../services/upload.service');

exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const result = uploadService.buildResult(req.file);
  res.status(201).json({ success: true, data: result });
});

// POST /api/v1/admin/upload/multiple — used by the Gallery uploader (product images, etc.)
exports.uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new AppError('No files uploaded', 400);
  const results = req.files.map((f) => uploadService.buildResult(f));
  res.status(201).json({ success: true, data: results });
});
