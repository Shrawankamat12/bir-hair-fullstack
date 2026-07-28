const asyncHandler = require('express-async-handler');
const wishlistService = require('../services/wishlist.service');

exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getOrCreate(req.user._id);
  res.json({ success: true, data: wishlist });
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.toggle(req.user._id, req.body.productId);
  res.json({ success: true, data: wishlist });
});
