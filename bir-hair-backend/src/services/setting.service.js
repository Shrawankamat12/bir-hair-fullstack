const { settingRepository } = require('../repositories');

class SettingService {
  async get() {
    let settings = await settingRepository.model.findOne();
    if (!settings) settings = await settingRepository.create({});
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
