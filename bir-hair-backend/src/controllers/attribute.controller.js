const asyncHandler = require('express-async-handler');
const attributeService = require('../services/attribute.service');

exports.getAttributes = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  const data = await attributeService.listAll(filter);
  res.json({ success: true, data });
});

exports.getAttribute = asyncHandler(async (req, res) => {
  const data = await attributeService.getById(req.params.id);
  res.json({ success: true, data });
});

exports.createAttribute = asyncHandler(async (req, res) => {
  const data = await attributeService.create(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateAttribute = asyncHandler(async (req, res) => {
  const data = await attributeService.updateById(req.params.id, req.body);
  res.json({ success: true, data });
});

exports.deleteAttribute = asyncHandler(async (req, res) => {
  await attributeService.deleteById(req.params.id);
  res.json({ success: true, message: 'Attribute deleted' });
});
