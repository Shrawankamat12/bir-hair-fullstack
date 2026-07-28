const asyncHandler = require('express-async-handler');
const bannerService = require('../services/banner.service');

exports.getBanners = asyncHandler(async (req, res) => {
  const banners = await bannerService.listPublic(req.query.placement);
  res.json({ success: true, data: banners });
});

exports.getAllBannersAdmin = asyncHandler(async (req, res) => {
  const banners = await bannerService.listAll();
  res.json({ success: true, data: banners });
});

exports.createBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.create(req.body);
  res.status(201).json({ success: true, data: banner });
});

exports.updateBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.updateById(req.params.id, req.body);
  res.json({ success: true, data: banner });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  await bannerService.deleteById(req.params.id);
  res.json({ success: true, message: 'Banner deleted' });
});
