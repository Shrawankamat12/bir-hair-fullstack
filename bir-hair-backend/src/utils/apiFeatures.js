// Reusable query helper for filter / sort / search / pagination on list endpoints
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excluded = ['page', 'limit', 'sort', 'search', 'fields'];
    const queryObj = { ...this.queryString };
    excluded.forEach((f) => delete queryObj[f]);

    // supports gte/gt/lte/lt e.g. price[gte]=1000
    let queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(fields = ['name']) {
    if (this.queryString.search) {
      const regex = new RegExp(this.queryString.search, 'i');
      this.query = this.query.find({ $or: fields.map((f) => ({ [f]: regex })) });
    }
    return this;
  }

  sort() {
    this.query = this.query.sort(this.queryString.sort ? this.queryString.sort.split(',').join(' ') : '-createdAt');
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 20;
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
