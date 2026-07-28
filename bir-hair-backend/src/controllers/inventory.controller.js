const asyncHandler = require('express-async-handler');
const inventoryService = require('../services/inventory.service');

exports.getInventory = asyncHandler(async (req, res) => {
  const data = await inventoryService.list();
  res.json({ success: true, data });
});

exports.adjustInventory = asyncHandler(async (req, res) => {
  const data = await inventoryService.adjust(req.params.productId, req.body, req.user?._id);
  res.status(201).json({ success: true, data });
});

exports.getInventoryHistory = asyncHandler(async (req, res) => {
  const data = await inventoryService.history(req.params.productId);
  res.json({ success: true, data });
});
