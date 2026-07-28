const asyncHandler = require('express-async-handler');
const dashboardService = require('../services/dashboard.service');

exports.getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary();
  res.json({ success: true, data: summary });
});
