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
}

module.exports = new SettingService();