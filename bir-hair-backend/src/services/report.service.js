const { orderRepository, productRepository, userRepository } = require('../repositories');

class ReportService {
  async sales({ from, to } = {}) {
    const match = { paymentStatus: 'paid' };
    if (from || to) match.createdAt = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
    const rows = await orderRepository.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return rows.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders }));
  }

  /** Flat order list (orderNumber/customerName/status/total) for the Orders report tab. */
  async orders() {
    const orders = await orderRepository.find({}, { sort: '-createdAt', limit: 200, populate: { path: 'user', select: 'name' } });
    return orders.map((o) => ({
      orderNumber: o.orderNumber,
      customerName: o.user?.name || o.shippingAddress?.fullName || 'Guest',
      status: o.status,
      total: o.total,
    }));
  }

  /** Top customers by lifetime spend for the Customers report tab. */
  async customers() {
    return orderRepository.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$user', totalSpent: { $sum: '$total' }, ordersCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 20 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 0, name: '$user.name', ordersCount: 1, totalSpent: 1 } },
    ]);
  }

  /** Low + out-of-stock products, flattened for the Inventory report tab. */
  async inventory() {
    const products = await productRepository.find(
      { $expr: { $lte: ['$stock', '$minStock'] } },
      { select: 'name sku stock minStock', sort: 'stock' },
    );
    return products.map((p) => ({ name: p.name, sku: p.sku, stock: p.stock, minStock: p.minStock }));
  }

  /** Best-selling products by revenue for the Products report tab. */
  async products() {
    return orderRepository.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, unitsSold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 30 },
      { $project: { _id: 0, name: 1, unitsSold: 1, revenue: 1 } },
    ]);
  }
}

module.exports = new ReportService();
