const BaseService = require('./base.service');
const { testimonialRepository } = require('../repositories');

class TestimonialService extends BaseService {
  constructor() {
    super(testimonialRepository, 'Testimonial');
  }

  /** Admin sends customerName/message/status — map onto the storefront's name/quote/isActive. */
  normalize(payload) {
    const body = { ...payload };
    if (body.customerName) { body.name = body.customerName; delete body.customerName; }
    if (body.message) { body.quote = body.message; delete body.message; }
    if (typeof body.status === 'boolean') { body.isActive = body.status; delete body.status; }
    return body;
  }

  decorate(doc) {
    const t = doc.toObject ? doc.toObject() : doc;
    return { ...t, customerName: t.name, message: t.quote, status: t.isActive };
  }

  async create(payload) {
    return this.repository.create(this.normalize(payload));
  }

  async updateById(id, payload) {
    return super.updateById(id, this.normalize(payload));
  }

  async listPublic() {
    return this.repository.find({ isActive: true }, { sort: 'order' });
  }

  async listAll() {
    const rows = await this.repository.find({}, { sort: 'order' });
    return rows.map((t) => this.decorate(t));
  }
}

module.exports = new TestimonialService();
