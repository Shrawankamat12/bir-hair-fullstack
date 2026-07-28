const asyncHandler = require('express-async-handler');
const couponService = require('../services/coupon.service');

// POST /api/v1/coupons/apply { code, subtotal }
exports.applyCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const result = await couponService.apply(code, subtotal, req.user);
  res.json({ success: true, data: result });
});

exports.getAllCouponsAdmin = asyncHandler(async (req, res) => {
  const coupons = await couponService.listAll();
  res.json({ success: true, data: coupons });
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateById(req.params.id, req.body);
  res.json({ success: true, data: coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await couponService.deleteById(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});
