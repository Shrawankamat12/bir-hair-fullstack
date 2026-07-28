const BaseService = require('./base.service');
const { collectionRepository } = require('../repositories');

class CollectionService extends BaseService {
  constructor() {
    super(collectionRepository, 'Collection');
  }

  async listAll() {
    return this.repository.find({}, { sort: 'name' });
  }
}

module.exports = new CollectionService();
