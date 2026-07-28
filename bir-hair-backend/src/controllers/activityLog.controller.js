const asyncHandler = require('express-async-handler');
const activityLogService = require('../services/activityLog.service');

exports.getActivityLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.entity) filter.entity = req.query.entity;
  const data = await activityLogService.listAll(filter);
  res.json({ success: true, data });
});
