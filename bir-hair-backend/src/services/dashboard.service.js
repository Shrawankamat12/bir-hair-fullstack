const {
  orderRepository, productRepository, userRepository, wholesaleRepository,
  categoryRepository, brandRepository, notificationRepository, activityLogRepository,
} = require('../repositories');

class DashboardService {
  async getSummary() {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [
      ordersCount, productsCount, customersCount, categoriesCount, brandsCount, pendingInquiries,
      revenueAgg, recentOrdersRaw, lowStock, salesByDayAgg, statusBreakdownAgg,
      recentCustomers, bestSellersAgg, categoryAgg, notificationsRaw, activityRaw,
    ] = await Promise.all([
      orderRepository.count(),
      productRepository.count(),
      userRepository.count({ role: 'customer' }),
      categoryRepository.count(),
      brandRepository.count(),
      wholesaleRepository.count({ status: 'new' }),
      orderRepository.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      orderRepository.find({}, { sort: '-createdAt', limit: 6, populate: { path: 'user', select: 'name email' } }),
      productRepository.find({ $expr: { $lte: ['$stock', '$minStock'] } }, { select: 'name stock sku minStock' }),
      orderRepository.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      orderRepository.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      userRepository.find({ role: 'customer' }, { sort: '-createdAt', limit: 6, select: 'name email createdAt' }),
      orderRepository.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', name: { $first: '$items.name' }, image: { $first: '$items.image' }, unitsSold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
        { $sort: { unitsSold: -1 } },
        { $limit: 6 },
      ]),
      productRepository.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', value: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$cat.name', 'Uncategorized'] }, value: 1 } },
        { $sort: { value: -1 } },
        { $limit: 6 },
      ]),
      notificationRepository.find({}, { sort: '-createdAt', limit: 5 }),
      activityLogRepository.find({}, { sort: '-createdAt', limit: 6 }),
    ]);

    // Fill in any missing days in the last 14 so the chart doesn't have gaps.
    const salesTrend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      const match = salesByDayAgg.find((r) => r._id === key);
      salesTrend.push({ date: key, revenue: match?.revenue || 0, orders: match?.orders || 0 });
    }

    const ordersByStatus = statusBreakdownAgg.map((s) => ({ status: s._id, count: s.count }));
    const countFor = (statuses) => statusBreakdownAgg.filter((s) => statuses.includes(s._id)).reduce((sum, s) => sum + s.count, 0);

    const recentOrders = recentOrdersRaw.map((o) => ({
      _id: o._id, orderNumber: o.orderNumber, status: o.status, total: o.total,
      customerName: o.user?.name || o.shippingAddress?.fullName || 'Guest',
    }));

    return {
      revenue: revenueAgg[0]?.total || 0,
      ordersCount, productsCount, customersCount, categoriesCount, brandsCount,
      lowStockCount: lowStock.length,
      pendingOrders: countFor(['placed', 'confirmed']),
      completedOrders: countFor(['delivered']),
      cancelledOrders: countFor(['cancelled', 'returned']),
      pendingInquiries,
      recentOrders,
      recentCustomers,
      bestSellers: bestSellersAgg,
      salesTrend,
      ordersByStatus,
      categoryBreakdown: categoryAgg,
      lowStock,
      notifications: notificationsRaw.map((n) => ({ message: n.message ? `${n.title} — ${n.message}` : n.title, type: n.type, at: n.createdAt })),
      activity: activityRaw.map((a) => ({ message: `${a.userName || 'System'} ${a.action} ${a.entity}`, at: a.createdAt })),
    };
  }
}

module.exports = new DashboardService();
