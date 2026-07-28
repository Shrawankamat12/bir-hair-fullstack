const BaseService = require('./base.service');
const { blogCommentRepository } = require('../repositories');

class BlogCommentService extends BaseService {
  constructor() {
    super(blogCommentRepository, 'Blog Comment');
  }

  async listAll(filter = {}) {
    return this.repository.find(filter, { sort: '-createdAt', populate: 'blogId' });
  }
}

module.exports = new BlogCommentService();
