const asyncHandler = require('express-async-handler');
const reviewService = require('../services/review.service');

exports.getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getProductReviews(req.params.productId);
  res.json({ success: true, data: reviews });
});

exports.createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user, req.body);
  res.status(201).json({ success: true, data: review });
});

exports.getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const reviews = await reviewService.listAllAdmin(filter);
  res.json({ success: true, data: reviews });
});

// PUT /api/v1/admin/reviews/:id — generic update (approve/reject via status, or post a reply)
exports.updateReviewAdmin = asyncHandler(async (req, res) => {
  const review = await reviewService.updateAdmin(req.params.id, req.body);
  res.json({ success: true, data: review });
});

exports.approveReview = asyncHandler(async (req, res) => {
  const review = await reviewService.approve(req.params.id);
  res.json({ success: true, data: review });
});

exports.replyToReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateAdmin(req.params.id, { reply: req.body.message });
  res.json({ success: true, data: review });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteById(req.params.id);
  res.json({ success: true, message: 'Review deleted' });
});
