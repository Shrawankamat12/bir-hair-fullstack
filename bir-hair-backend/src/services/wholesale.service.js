const BaseService = require('./base.service');
const { wholesaleRepository } = require('../repositories');

class WholesaleService extends BaseService {
  constructor() {
    super(wholesaleRepository, 'Wholesale inquiry');
  }

  /** Admin sends companyName/quantity — map onto the schema's businessName/estimatedMOQ. */
  normalize(payload) {
    const body = { ...payload };
    if (body.companyName) { body.businessName = body.companyName; delete body.companyName; }
    if (body.quantity !== undefined) { body.estimatedMOQ = body.quantity; delete body.quantity; }
    if (body.status === 'declined') body.status = 'closed'; // admin's simplified vocabulary
    return body;
  }

  decorate(doc) {
    const w = doc.toObject ? doc.toObject() : doc;
    return { ...w, companyName: w.businessName, quantity: w.estimatedMOQ, status: w.status === 'closed' ? 'declined' : w.status };
  }

  async create(payload) {
    return this.repository.create(this.normalize(payload));
  }

  async updateById(id, payload) {
    const updated = await super.updateById(id, this.normalize(payload));
    return this.decorate(updated);
  }

  async listAll(status) {
    const filter = status ? { status: status === 'declined' ? 'closed' : status } : {};
    const rows = await this.repository.find(filter, { sort: '-createdAt' });
    return rows.map((w) => this.decorate(w));
  }
}

module.exports = new WholesaleService();
