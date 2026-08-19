const asyncHandler = require('express-async-handler');
const paymentService = require('../services/payment.service');
const orderService = require('../services/order.service');
const AppError = require('../utils/AppError');

// GET /api/v1/payments/razorpay/status — lets the frontend know whether to
// show the card/UPI option at all (falls back to COD if not configured).
exports.getStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { configured: paymentService.isConfigured } });
});

// POST /api/v1/payments/razorpay/order  { orderId }
// Creates a Razorpay order against an existing (pending) B.I.R order.
exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getByIdOrOrderNumber(req.body.orderId);
  if (order.paymentStatus === 'paid') throw new AppError('This order has already been paid', 400);

const rpOrder = await paymentService.createRazorpayOrder(order.pricing.grandTotal, order.orderNumber);
  await orderService.updateById(order._id, { razorpayOrderId: rpOrder.id });

  res.json({
    success: true,
    data: {
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order._id,
      orderNumber: order.orderNumber,
    },
  });
});

// POST /api/v1/payments/razorpay/verify
// { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
exports.verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  paymentService.verifySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });

  const order = await orderService.updateById(orderId, {
    paymentStatus: 'paid',
    status: 'confirmed',
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  res.json({ success: true, data: order });
});
