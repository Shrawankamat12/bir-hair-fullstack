const BaseService = require('./base.service');
const { notificationRepository } = require('../repositories');

class NotificationService extends BaseService {
  constructor() {
    super(notificationRepository, 'Notification');
  }

  async listAll() {
    return this.repository.find({}, { sort: '-createdAt', limit: 100 });
  }

  async markRead(id) {
    return this.updateById(id, { isRead: true });
  }

  async markAllRead() {
    return notificationRepository.model.updateMany({ isRead: false }, { isRead: true });
  }

  async push({ title, message, type = 'system', link }) {
    return this.repository.create({ title, message, type, link });
  }
}

module.exports = new NotificationService();
