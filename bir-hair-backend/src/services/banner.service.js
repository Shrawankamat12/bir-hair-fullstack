const BaseService = require('./base.service');
const { bannerRepository } = require('../repositories');

class BannerService extends BaseService {
  constructor() {
    super(bannerRepository, 'Banner');
  }

  /** Admin sends position/linkUrl/sortOrder/status — map onto the storefront's placement/ctaLink/order/isActive. */
  normalize(payload) {
    const body = { ...payload };
    if (body.position) { body.placement = body.position; delete body.position; }
    if (body.linkUrl) { body.ctaLink = body.linkUrl; delete body.linkUrl; }
    if (body.sortOrder !== undefined) { body.order = body.sortOrder; delete body.sortOrder; }
    if (typeof body.status === 'boolean') { body.isActive = body.status; delete body.status; }
    return body;
  }

  async create(payload) {
    return this.repository.create(this.normalize(payload));
  }

  async updateById(id, payload) {
    return super.updateById(id, this.normalize(payload));
  }

  decorate(doc) {
    const b = doc.toObject ? doc.toObject() : doc;
    return { ...b, position: b.placement, status: b.isActive, sortOrder: b.order };
  }

  async listPublic(placement) {
    const filter = { isActive: true, ...(placement && { placement }) };
    return this.repository.find(filter, { sort: 'order' });
  }

  async listAll() {
    const banners = await this.repository.find({}, { sort: 'order' });
    return banners.map((b) => this.decorate(b));
  }
}

module.exports = new BannerService();
