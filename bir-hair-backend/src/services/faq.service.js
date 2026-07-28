const BaseService = require('./base.service');
const { faqRepository } = require('../repositories');

class FaqService extends BaseService {
  constructor() {
    super(faqRepository, 'FAQ');
  }

  /** Admin sends sortOrder/status — map onto the storefront's order/isActive. */
  normalize(payload) {
    const body = { ...payload };
    if (body.sortOrder !== undefined) { body.order = body.sortOrder; delete body.sortOrder; }
    if (typeof body.status === 'boolean') { body.isActive = body.status; delete body.status; }
    return body;
  }

  decorate(doc) {
    const f = doc.toObject ? doc.toObject() : doc;
    return { ...f, sortOrder: f.order, status: f.isActive };
  }

  async create(payload) {
    return this.repository.create(this.normalize(payload));
  }

  async updateById(id, payload) {
    return super.updateById(id, this.normalize(payload));
  }

  async listPublic() {
    return this.repository.find({ isActive: true }, { sort: 'category order' });
  }

  async listAll() {
    const rows = await this.repository.find({}, { sort: 'category order' });
    return rows.map((f) => this.decorate(f));
  }
}

module.exports = new FaqService();
