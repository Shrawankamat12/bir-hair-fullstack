const logger = require('../config/logger');

// B.I.R Hair now takes online payments through a single, fixed Bluevine
// Payment Link instead of an embedded gateway. The customer is redirected
// to this link after placing an order; the order stays "pending / unpaid"
// until an admin manually marks it as Paid in the admin panel once the
// Bluevine payment shows up in the account.
const paymentLink = process.env.BLUEVINE_PAYMENT_LINK || '';

const isConfigured = Boolean(paymentLink);

if (!isConfigured) {
  logger.warn('BLUEVINE_PAYMENT_LINK is not set — online payment option will be unavailable (COD still works).');
}

class PaymentService {
  get isConfigured() {
    return isConfigured;
  }

  get paymentLink() {
    return paymentLink;
  }
}

module.exports = new PaymentService();