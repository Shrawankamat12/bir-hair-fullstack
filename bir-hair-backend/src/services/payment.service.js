const logger = require('../config/logger');
const { settingRepository } = require('../repositories');

// B.I.R Hair now takes online payments through a single, fixed Bluevine
// Payment Link instead of an embedded gateway. The customer is redirected
// to this link after placing an order; the order stays "pending / unpaid"
// until an admin manually marks it as Paid in the admin panel once the
// Bluevine payment shows up in the account.
//
// The link lives in the DB (Setting.bluevinePaymentLink), set from the
// admin panel's Settings -> Payment tab. process.env.BLUEVINE_PAYMENT_LINK
// is only a fallback for first boot, before anyone has saved Settings --
// setting.service.js seeds the DB from it automatically on first read.
const envFallback = process.env.BLUEVINE_PAYMENT_LINK || '';

if (!envFallback) {
  logger.warn('BLUEVINE_PAYMENT_LINK env var not set - relying entirely on the admin-panel Settings value for online payments.');
}

class PaymentService {
  async _getLink() {
    const settings = await settingRepository.model.findOne();
    return (settings && settings.bluevinePaymentLink) || envFallback || '';
  }

  async isConfigured() {
    const link = await this._getLink();
    return Boolean(link);
  }

  async getPaymentLink() {
    return this._getLink();
  }
}

module.exports = new PaymentService();
