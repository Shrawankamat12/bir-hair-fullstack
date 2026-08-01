const asyncHandler = require('express-async-handler');
const siteContentService = require('../services/siteContent.service');

// GET /api/v1/site-content  (public — powers Home page, Footer, Header)
exports.getSiteContent = asyncHandler(async (req, res) => {
  const data = await siteContentService.get();
  res.json({ success: true, data });
});

// PUT /api/v1/admin/site-content  (admin only)
exports.updateSiteContent = asyncHandler(async (req, res) => {
  const data = await siteContentService.update(req.body);
  res.json({ success: true, data });
});
