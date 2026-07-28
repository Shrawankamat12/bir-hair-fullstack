const BaseService = require('./base.service');
const { brandRepository } = require('../repositories');

class BrandService extends BaseService {
  constructor() {
    super(brandRepository, 'Brand');
  }

  async listAll() {
    return this.repository.find({}, { sort: 'name' });
  }
}

module.exports = new BrandService();
