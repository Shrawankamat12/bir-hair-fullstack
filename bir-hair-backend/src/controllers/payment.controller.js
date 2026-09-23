const asyncHandler = require('express-async-handler');
const paymentService = require('../services/payment.service');

// GET /api/v1/payments/status
// Tells the frontend whether the Bluevine Payment Link is configured, and
// gives it the link itself so the checkout / order-confirmation page can
// send the customer there after they place an order.
exports.getStatus = asyncHandler(async (req, res) => {
  const [configured, paymentLink] = await Promise.all([
    paymentService.isConfigured(),
    paymentService.getPaymentLink(),
  ]);

  res.json({
    success: true,
    data: { configured, paymentLink },
  });
});