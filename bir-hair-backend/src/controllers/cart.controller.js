const asyncHandler = require('express-async-handler');
const cartService = require('../services/cart.service');

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getOrCreate(req.user._id);
  res.json({ success: true, data: cart });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId = null, qty = 1 } = req.body;
  const cart = await cartService.addItem(req.user._id, productId, variantId, qty);
  res.json({ success: true, data: cart });
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { variantId = null } = req.body;
  const cart = await cartService.updateItem(req.user._id, req.params.productId, variantId, req.body.qty);
  res.json({ success: true, data: cart });
});

exports.removeCartItem = asyncHandler(async (req, res) => {
  const { variantId = null } = req.body;
  const cart = await cartService.removeItem(req.user._id, req.params.productId, variantId);
  res.json({ success: true, data: cart });
});