const BaseService = require('./base.service');
const { contactRepository } = require('../repositories');

class ContactService extends BaseService {
  constructor() {
    super(contactRepository, 'Message');
  }

  async listAll(status) {
    const filter = status ? { status } : {};
    return this.repository.find(filter, { sort: '-createdAt' });
  }

  async updateStatus(id, status) {
    return this.updateById(id, { status });
  }
}

module.exports = new ContactService();
