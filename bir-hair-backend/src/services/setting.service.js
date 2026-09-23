const { settingRepository } = require('../repositories');

class SettingService {
  async get() {
    let settings = await settingRepository.model.findOne();
    if (!settings) {
      settings = await settingRepository.create({
        // Seed from .env on first run so the admin panel shows something
        // sensible before anyone has saved Settings manually.
        bluevinePaymentLink: process.env.BLUEVINE_PAYMENT_LINK || '',
      });
    }
    return settings;
  }

  async update(payload) {
    let settings = await settingRepository.model.findOne();
    if (!settings) settings = await settingRepository.create(payload);
    else settings = await settingRepository.updateById(settings._id, payload);
    return settings;
  }

  /**
   * Storefront-safe subset of Settings — used by the public /settings
   * endpoint so the frontend can read shipping/tax/payment-link config
   * without exposing SMTP/SMS credentials or other admin-only fields.
   */
  async getPublic() {
    const settings = await this.get();

    return {
      storeName: settings.storeName,
      storeEmail: settings.storeEmail,
      storePhone: settings.storePhone,
      storeAddress: settings.storeAddress,
      logo: settings.logo,
      favicon: settings.favicon,

      freeShippingThreshold: settings.freeShippingThreshold ?? 15000,
      flatShippingRate: settings.flatShippingRate ?? 15,
      expressShippingRate: settings.expressShippingRate ?? 999,

      taxRate: settings.taxRate ?? 0,
      taxLabel: settings.taxLabel || 'GST',

      codEnabled: settings.codEnabled !== false,
      // The frontend only needs to know online payment is possible + the
      // link to send the customer to; /payments/status already exposes
      // this more explicitly, but we surface it here too for convenience.
      bluevinePaymentLink: settings.bluevinePaymentLink || '',

      facebook: settings.facebook, instagram: settings.instagram,
      twitter: settings.twitter, youtube: settings.youtube, whatsapp: settings.whatsapp,
    };
  }
}

module.exports = new SettingService();