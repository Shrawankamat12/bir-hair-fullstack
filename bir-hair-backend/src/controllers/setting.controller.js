const asyncHandler = require('express-async-handler');
const settingService = require('../services/setting.service');

exports.getSettings = asyncHandler(async (req, res) => {
  const data = await settingService.get();
  res.json({ success: true, data });
});

// GET /api/v1/settings (public — storefront reads shipping/tax/payment-link config)
exports.getPublicSettings = asyncHandler(async (req, res) => {
  const data = await settingService.getPublic();
  res.json({ success: true, data });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const data = await settingService.update(req.body);
  res.json({ success: true, data });
});
