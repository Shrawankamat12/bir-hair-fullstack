const crypto = require('crypto');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const isConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
);

let razorpayInstance = null;

if (isConfigured) {
  const Razorpay = require('razorpay');

  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  logger.warn(
    'RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set'
  );
}

class PaymentService {
  get isConfigured() {
    return isConfigured;
  }

  async createRazorpayOrder(amountInRupees, receipt) {
    if (!isConfigured) {
      throw new AppError(
        'Online payment is not configured yet — use Cash on Delivery.',
        503
      );
    }

    if (!razorpayInstance) {
      throw new AppError(
        'Razorpay is not initialized.',
        503
      );
    }

    const amount = Math.round(Number(amountInRupees) * 100);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError(
        'Invalid payment amount.',
        400
      );
    }

    return razorpayInstance.orders.create({
      amount,
      currency: 'INR',
      receipt: String(receipt),
    });
  }

  verifySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) {
    if (!isConfigured) {
      throw new AppError(
        'Online payment is not configured yet.',
        503
      );
    }

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      throw new AppError(
        'Incomplete Razorpay payment response.',
        400
      );
    }

    const expected = crypto
      .createHmac(
        'sha256',
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpayOrderId}|${razorpayPaymentId}`
      )
      .digest('hex');

    if (expected !== razorpaySignature) {
      throw new AppError(
        'Payment verification failed — signature mismatch',
        400
      );
    }

    return true;
  }
}

module.exports = new PaymentService();