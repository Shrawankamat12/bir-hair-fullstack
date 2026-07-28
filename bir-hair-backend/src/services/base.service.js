const AppError = require('../utils/AppError');

/**
 * Thin business-logic layer over a repository. Controllers call services,
 * services call repositories. Plain pass-throughs live here; anything with
 * real logic (slugs, totals, aggregation, etc.) is overridden in the
 * resource-specific service.
 */
class BaseService {
  constructor(repository, resourceName = 'Resource') {
    this.repository = repository;
    this.resourceName = resourceName;
  }

  async getById(id, options) {
    const doc = await this.repository.findById(id, options);
    if (!doc) throw new AppError(`${this.resourceName} not found`, 404);
    return doc;
  }

  async list(filter, queryString, options) {
    return this.repository.list(filter, queryString, options);
  }

  async find(filter, options) {
    return this.repository.find(filter, options);
  }

  async create(payload) {
    return this.repository.create(payload);
  }

  async updateById(id, payload, options) {
    const doc = await this.repository.updateById(id, payload, options);
    if (!doc) throw new AppError(`${this.resourceName} not found`, 404);
    return doc;
  }

  async deleteById(id) {
    const doc = await this.repository.deleteById(id);
    if (!doc) throw new AppError(`${this.resourceName} not found`, 404);
    return doc;
  }
}

module.exports = BaseService;
