const ApiFeatures = require('../utils/apiFeatures');

/**
 * Generic data-access layer over a single Mongoose model.
 * Resource-specific repositories extend this instead of re-writing
 * the same find/create/update/delete boilerplate 14 times.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, { populate, select } = {}) {
    let query = this.model.findById(id);
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    return query;
  }

  async findOne(filter = {}, { populate, select } = {}) {
    let query = this.model.findOne(filter);
    if (populate) query = query.populate(populate);
    if (select) query = query.select(select);
    return query;
  }

  async find(filter = {}, { populate, sort, select, limit } = {}) {
    let query = this.model.find(filter);
    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort);
    if (select) query = query.select(select);
    if (limit) query = query.limit(limit);
    return query;
  }

  /**
   * List with the shared filter/search/sort/paginate pipeline (ApiFeatures).
   * Returns both the page of results and the total count for pagination UIs.
   */
  async list(baseFilter, queryString, { populate, searchFields = [] } = {}) {
    let base = this.model.find(baseFilter);
    if (populate) base = base.populate(populate);

    const features = new ApiFeatures(base, queryString).filter().search(searchFields).sort().paginate();
    const [data, total] = await Promise.all([
      features.query,
      this.model.countDocuments(baseFilter),
    ]);

    const page = parseInt(queryString.page, 10) || 1;
    const limit = parseInt(queryString.limit, 10) || 20;

    return { data, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
  }

  async create(payload) {
    return this.model.create(payload);
  }

  async updateById(id, payload, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, payload, options);
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }
}

module.exports = BaseRepository;
