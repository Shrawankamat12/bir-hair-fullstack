const asyncHandler = require('express-async-handler');
const collectionService = require('../services/collection.service');

exports.getCollections = asyncHandler(async (req, res) => {
  const data = await collectionService.listAll();
  res.json({ success: true, data });
});

exports.getCollection = asyncHandler(async (req, res) => {
  const data = await collectionService.getById(req.params.id);
  res.json({ success: true, data });
});

exports.createCollection = asyncHandler(async (req, res) => {
  const data = await collectionService.create(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateCollection = asyncHandler(async (req, res) => {
  const data = await collectionService.updateById(req.params.id, req.body);
  res.json({ success: true, data });
});

exports.deleteCollection = asyncHandler(async (req, res) => {
  await collectionService.deleteById(req.params.id);
  res.json({ success: true, message: 'Collection deleted' });
});
