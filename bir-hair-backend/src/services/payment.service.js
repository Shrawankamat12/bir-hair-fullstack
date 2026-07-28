const crypto = require('crypto');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const isConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

let razorpayInstance = null;
if (isConfigured) {
  const Razorpay = require('razorpay');
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  logger.warn('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — card/UPI checkout will be unavailable until configured.');
}

class PaymentService {
  get isConfigured() {
    return isConfigured;
  }

  /**
   * Creates a Razorpay order for the given amount (in rupees) so the frontend
   * can open Razorpay Checkout. `receipt` should be our own order number so
   * the two systems are traceable against each other.
   */
  async createRazorpayOrder(amountInRupees, receipt) {
    if (!isConfigured) throw new AppError('Online payment is not configured yet — use Cash on Delivery.', 503);

    return razorpayInstance.orders.create({
      amount: Math.round(amountInRupees * 100), // paise
      currency: 'INR',
      receipt,
      payment_capture: 1,
    });
  }

  /**
   * Verifies the signature Razorpay Checkout returns after a successful payment.
   * This MUST pass before we mark an order as paid — never trust the client alone.
   */
  verifySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    if (!isConfigured) throw new AppError('Online payment is not configured yet.', 503);

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expected !== razorpaySignature) {
      throw new AppError('Payment verification failed — signature mismatch', 400);
    }
    return true;
  }
}

module.exports = new PaymentService();
