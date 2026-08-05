const BaseService = require('./base.service');
const { userRepository, orderRepository, wishlistRepository, reviewRepository } = require('../repositories');

class CustomerService extends BaseService {
  constructor() {
    super(userRepository, 'Customer');
  }

  decorate(doc) {
    const u = doc.toObject ? doc.toObject() : doc;
    return { ...u, status: u.isActive ? (u.isBlocked ? 'blocked' : 'active') : 'banned' };
  }

  // Uses an aggregation ($lookup on orders) so the list shows real
  // ordersCount / totalSpent per customer without an N+1 query per row.
  async listAll() {
    const customers = await this.repository.model.aggregate([
      { $match: { role: 'customer' } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        },
      },
      {
        $addFields: {
          ordersCount: { $size: '$orders' },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$orders',
                    as: 'o',
                    cond: { $eq: ['$$o.payment.status', 'paid'] },
                  },
                },
                as: 'o',
                in: '$$o.pricing.grandTotal',
              },
            },
          },
        },
      },
      { $project: { orders: 0, password: 0, refreshToken: 0, resetPasswordToken: 0 } },
      { $sort: { createdAt: -1 } },
    ]);

    return customers.map((u) => this.decorate(u));
  }

  async getById(id) {
    const customer = await super.getById(id);
    const [orders, wishlistDoc, reviews] = await Promise.all([
      orderRepository.find({ user: id }, { sort: '-createdAt' }),
      wishlistRepository.findOne({ user: id }, { populate: { path: 'products', select: 'name price' } }).catch(() => null),
      reviewRepository.find({ user: id }, { populate: { path: 'product', select: 'name' }, sort: '-createdAt' }),
    ]);

    // Order schema uses nested payment.status / pricing.grandTotal (not flat paymentStatus / total).
    const totalSpent = orders
      .filter((o) => o.payment?.status === 'paid')
      .reduce((sum, o) => sum + (o.pricing?.grandTotal || 0), 0);

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