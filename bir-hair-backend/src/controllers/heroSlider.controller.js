const asyncHandler = require('express-async-handler');
const heroSliderService = require('../services/heroSlider.service');
const activityLogService = require('../services/activityLog.service');

// GET /api/v1/hero-slider  (public — active content only)
exports.getHeroSlider = asyncHandler(async (req, res) => {
  const data = await heroSliderService.getPublic();
  // Always revalidate so admin edits show up on the next page refresh.
  res.set('Cache-Control', 'no-cache');
  res.json({ success: true, data });
});

// GET /api/v1/admin/hero-slider  (admin/staff — everything, incl. disabled items)
exports.getHeroSliderAdmin = asyncHandler(async (req, res) => {
  const data = await heroSliderService.getAdmin();
  res.json({ success: true, data });
});

// PUT /api/v1/admin/hero-slider  (admin only)
exports.updateHeroSlider = asyncHandler(async (req, res) => {
  const data = await heroSliderService.update(req.body);
  activityLogService.log({ user: req.user, action: 'updated', entity: 'HeroSlider' });
  res.json({ success: true, data });
});

// POST /api/v1/admin/hero-slider/initialize  (admin only — refuses if already configured)
exports.initializeHeroSlider = asyncHandler(async (req, res) => {
  const data = await heroSliderService.seedDefaults();
  activityLogService.log({ user: req.user, action: 'created', entity: 'HeroSlider' });
  res.status(201).json({ success: true, data });
});