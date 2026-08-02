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
  let data;

  // File upload (multipart/form-data)
  if (req.file) {
    data = await mediaService.save({
      file: req.file,
      folder: req.body.folder,
      userId: req.user?._id,
    });
  }
  // JSON request
  else if (req.body.url) {
    data = await mediaService.save({
      url: req.body.url,
      publicId: req.body.publicId,
      folder: req.body.folder,
      originalName: req.body.originalName,
      size: req.body.size,
      mimeType: req.body.mimeType,
      userId: req.user?._id,
    });
  } else {
    throw new AppError('No file or URL provided', 400);
  }

  res.status(201).json({
    success: true,
    data,
  });
});

exports.deleteMedia = asyncHandler(async (req, res) => {
  await mediaService.remove(req.params.id);
  res.json({
    success: true,
    message: 'Media deleted',
  });
});