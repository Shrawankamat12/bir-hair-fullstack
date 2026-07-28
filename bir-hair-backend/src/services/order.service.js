const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { orderRepository } = require('../repositories');
const generateOrderNumber = require('../utils/generateOrderNumber');

class OrderService extends BaseService {
  constructor() {
    super(orderRepository, 'Order');
  }

  async createOrder(user, payload) {
    const { items, shippingAddress, shippingMethod, paymentMethod, couponCode, discountAmount = 0 } = payload;

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shippingCost = shippingMethod === 'express' ? 999 : subtotal > 15000 ? 0 : 499;
    const total = subtotal + shippingCost - discountAmount;

    return this.repository.create({
      user: user?._id,
      isGuest: !user,
      orderNumber: generateOrderNumber(),
      items,
      shippingAddress,
      shippingMethod,
      shippingCost,
      paymentMethod,
      subtotal,
      total,
      couponCode,
      discountAmount,
    });
  }

  async getMyOrders(userId) {
    return this.repository.find({ user: userId }, { sort: '-createdAt' });
  }

  async getByIdOrOrderNumber(idOrNumber) {
    const order = await this.repository.findOne({ $or: [{ _id: idOrNumber }, { orderNumber: idOrNumber }] });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  /** Adds the fields the admin panel's Order Details/Invoice/Packing Slip/Shipping
   *  Label pages read directly (customerName/email/phone/timeline/shippingFee/discount)
   *  without renaming anything on the stored document. */
  decorate(orderDoc) {
    const order = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
    const addr = order.shippingAddress || {};
    return {
      ...order,
      customerName: order.user?.name || addr.fullName || 'Guest',
      email: order.user?.email || addr.email || '',
      phone: order.user?.phone || addr.phone || '',
      itemsCount: order.items?.length || 0,
      shippingFee: order.shippingCost || 0,
      discount: order.discountAmount || 0,
      timeline: order.statusHistory?.length ? order.statusHistory : [{ status: order.status, at: order.createdAt }],
    };
  }

  async listAll(status) {
    const filter = status ? { status } : {};
    const orders = await this.repository.find(filter, { sort: '-createdAt', populate: { path: 'user', select: 'name email phone' } });
    return orders.map((o) => this.decorate(o));
  }

  async getByIdAdmin(id) {
    const order = await this.repository.findById(id, { populate: { path: 'user', select: 'name email phone' } });
    if (!order) throw new AppError('Order not found', 404);
    return this.decorate(order);
  }

  async updateStatus(id, { status, trackingId, paymentStatus }) {
    const order = await this.repository.model.findById(id);
    if (!order) throw new AppError('Order not found', 404);
    if (status) order.status = status;
    if (trackingId) order.trackingId = trackingId;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save(); // triggers the pre('save') hook that appends to statusHistory
    return this.decorate(order);
  }
}

module.exports = new OrderService();
