const BaseService = require('./base.service');
const { userRepository, orderRepository, wishlistRepository, reviewRepository } = require('../repositories');

class CustomerService extends BaseService {
  constructor() {
    super(userRepository, 'Customer');
  }

  decorate(doc) {
    const u = doc.toObject ? doc.toObject() : doc;
    return { ...u, status: u.isActive ? 'active' : 'banned' };
  }

  async listAll() {
    const rows = await this.repository.find({ role: 'customer' }, { sort: '-createdAt' });
    return rows.map((u) => this.decorate(u));
  }

  async getById(id) {
    const customer = await super.getById(id);
    const [orders, wishlistDoc, reviews] = await Promise.all([
      orderRepository.find({ user: id }, { sort: '-createdAt' }),
      wishlistRepository.findOne({ user: id }, { populate: { path: 'products', select: 'name price' } }).catch(() => null),
      reviewRepository.find({ user: id }, { populate: { path: 'product', select: 'name' }, sort: '-createdAt' }),
    ]);
    const totalSpent = orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      ...this.decorate(customer),
      orders,
      ordersCount: orders.length,
      totalSpent,
      wishlist: (wishlistDoc?.products || []).map((p) => ({ name: p.name, price: p.price })),
      reviews: reviews.map((r) => ({ productName: r.product?.name || '', rating: r.rating, comment: r.comment })),
    };
  }

  async create(payload) {
    const tempPassword = payload.password || Math.random().toString(36).slice(-10) + 'A1!';
    return this.repository.create({ ...payload, password: tempPassword, role: 'customer' });
  }
}

module.exports = new CustomerService();
