const asyncHandler = require('express-async-handler');
const siteContentService = require('../services/siteContent.service');

exports.getSiteContent = asyncHandler(async (req, res) => {
  const data = await siteContentService.get();
  res.json({ success: true, data });
});

exports.updateSiteContent = asyncHandler(async (req, res) => {
  const data = await siteContentService.update(req.body);
  res.json({ success: true, data });
});
