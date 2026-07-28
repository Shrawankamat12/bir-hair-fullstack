const slugify = require('slugify');
const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { blogRepository } = require('../repositories');

class BlogService extends BaseService {
  constructor() {
    super(blogRepository, 'Blog');
  }

  async listPublic(category) {
    const filter = category ? { category, isPublished: true } : { isPublished: true };
    return this.repository.find(filter, { sort: '-publishedAt' });
  }

  async listAll() {
    return this.repository.find({}, { sort: '-createdAt' });
  }

  async getBySlug(slug) {
    const blog = await this.repository.findOne({ slug });
    if (!blog) throw new AppError('Blog not found', 404);
    return blog;
  }

  async create(payload) {
    const body = { ...payload, slug: slugify(payload.title, { lower: true, strict: true }) };
    return this.repository.create(body);
  }

  async updateById(id, payload) {
    const body = { ...payload };
    if (body.title) body.slug = slugify(body.title, { lower: true, strict: true });
    return super.updateById(id, body);
  }
}

module.exports = new BlogService();
