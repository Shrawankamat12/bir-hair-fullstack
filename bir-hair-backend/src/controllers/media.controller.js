const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');
const mediaService = require('../services/media.service');

exports.getMedia = asyncHandler(async (req, res) => {
  const data = await mediaService.list(req.query.folder);
  res.json({ success: true, data });
});

exports.getFolders = asyncHandler(async (req, res) => {
  const data = await mediaService.folders();
  res.json({ success: true, data });
});

exports.uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const data = await mediaService.save({ file: req.file, folder: req.body.folder, userId: req.user?._id });
  res.status(201).json({ success: true, data });
});

exports.deleteMedia = asyncHandler(async (req, res) => {
  await mediaService.remove(req.params.id);
  res.json({ success: true, message: 'Media deleted' });
});
