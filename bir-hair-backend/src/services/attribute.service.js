const BaseService = require('./base.service');
const { attributeRepository } = require('../repositories');

class AttributeService extends BaseService {
  constructor() {
    super(attributeRepository, 'Attribute');
  }

  async listAll(filter = {}) {
    return this.repository.find(filter, { sort: 'type sortOrder name' });
  }
}

module.exports = new AttributeService();
