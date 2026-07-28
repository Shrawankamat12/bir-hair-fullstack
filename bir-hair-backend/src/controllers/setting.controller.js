const asyncHandler = require('express-async-handler');
const settingService = require('../services/setting.service');

exports.getSettings = asyncHandler(async (req, res) => {
  const data = await settingService.get();
  res.json({ success: true, data });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const data = await settingService.update(req.body);
  res.json({ success: true, data });
});
