const slugify = require('slugify');
const BaseService = require('./base.service');
const { categoryRepository } = require('../repositories');

class CategoryService extends BaseService {
  constructor() {
    super(categoryRepository, 'Category');
  }

  async listAll() {
    return this.repository.find({}, { sort: 'order' });
  }

  async create(payload) {
    const body = { ...payload, slug: slugify(payload.name, { lower: true, strict: true }) };
    if (!body.parentId) body.parentId = null;
    return this.repository.create(body);
  }

  async updateById(id, payload) {
    const body = { ...payload };
    if (body.name) body.slug = slugify(body.name, { lower: true, strict: true });
    if (body.parentId === '') body.parentId = null;
    return super.updateById(id, body, { new: true, runValidators: true });
  }
}

module.exports = new CategoryService();
