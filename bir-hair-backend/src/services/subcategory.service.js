const BaseService = require('./base.service');
const { subCategoryRepository } = require('../repositories');

class SubCategoryService extends BaseService {
  constructor() {
    super(subCategoryRepository, 'Sub-Category');
  }

  async listAll(filter = {}) {
    return this.repository.find(filter, { sort: 'sortOrder name' });
  }
}

module.exports = new SubCategoryService();
