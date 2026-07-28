const BaseService = require('./base.service');
const { blogCategoryRepository } = require('../repositories');

class BlogCategoryService extends BaseService {
  constructor() {
    super(blogCategoryRepository, 'Blog Category');
  }

  async listAll() {
    return this.repository.find({}, { sort: 'name' });
  }
}

module.exports = new BlogCategoryService();
