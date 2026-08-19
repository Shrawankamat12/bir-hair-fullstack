const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { orderRepository } = require('../repositories');
const generateOrderNumber = require('../utils/generateOrderNumber');

class OrderService extends BaseService {
  constructor() {
    super(orderRepository, 'Order');
  }

  async createOrder(user, payload) {
    const {
      items,
      billingAddress,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      couponCode,
      couponDiscount = 0,
      orderSource = 'Website',
    } = payload;

    // Compute per-item pricing (finalPrice = unitPrice - discount, total = finalPrice * quantity)
    const processedItems = items.map((i) => {
      const unitPrice = i.unitPrice ?? i.price ?? 0;
      const discount = i.discount ?? 0;
      const quantity = i.quantity ?? i.qty ?? 1;
      const finalPrice = unitPrice - discount;
      return {
        ...i,
        unitPrice,
        discount,
        quantity,
        finalPrice,
        total: finalPrice * quantity,
      };
    });

    const subtotal = processedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const productDiscount = processedItems.reduce((sum, i) => sum + i.discount * i.quantity, 0);
    const shippingCharge = shippingMethod === 'express' ? 999 : subtotal > 15000 ? 0 : 15;
    const grandTotal = subtotal - productDiscount - couponDiscount + shippingCharge;

    return this.repository.create({
      user: user?._id || null,
      isGuest: !user,
      customerName: user?.name || shippingAddress?.fullName,
      customerEmail: user?.email || shippingAddress?.email,
      customerPhone: user?.phone || shippingAddress?.phone,

      orderNumber: generateOrderNumber(),
      orderSource,
      orderStatus: 'pending',

      items: processedItems,

      billingAddress: billingAddress || shippingAddress,
      shippingAddress,

      pricing: {
        subtotal,
        productDiscount,
        couponCode,
        couponDiscount,
        shippingCharge,
        tax: 0,
        grandTotal,
      },

      payment: {
        method: paymentMethod || 'card',
        status: 'pending',
      },

      shipping: {
        method: shippingMethod || 'standard',
      },

      isCOD: paymentMethod === 'cod',
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
    const pricing = order.pricing || {};
    return {
      ...order,
      customerName: order.user?.name || order.customerName || addr.fullName || 'Guest',
      email: order.user?.email || order.customerEmail || addr.email || '',
      phone: order.user?.phone || order.customerPhone || addr.phone || '',
      itemsCount: order.items?.length || 0,
      shippingFee: pricing.shippingCharge || 0,
      discount: (pricing.productDiscount || 0) + (pricing.couponDiscount || 0),
      timeline: order.statusHistory?.length
        ? order.statusHistory
        : [{ status: order.orderStatus, at: order.createdAt }],
    };
  }

  async listAll(status) {
    const filter = status ? { orderStatus: status } : {};
    const orders = await this.repository.find(filter, { sort: '-createdAt', populate: { path: 'user', select: 'name email phone' } });
    return orders.map((o) => this.decorate(o));
  }

  async getByIdAdmin(id) {
    const order = await this.repository.findById(id, { populate: { path: 'user', select: 'name email phone' } });
    if (!order) throw new AppError('Order not found', 404);
    return this.decorate(order);
  }

  async updateStatus(id, { status, orderStatus, trackingNumber, trackingId, paymentStatus }) {
    const order = await this.repository.model.findById(id);
    if (!order) throw new AppError('Order not found', 404);

    if (orderStatus || status) order.orderStatus = orderStatus || status;
    if (trackingNumber || trackingId) {
      order.shipping = order.shipping || {};
      order.shipping.trackingNumber = trackingNumber || trackingId;
    }
    if (paymentStatus) {
      order.payment = order.payment || {};
      order.payment.status = paymentStatus;
      order.isPaid = paymentStatus === 'paid';
    }

    await order.save(); // triggers the pre('save') hook that appends to statusHistory
    return this.decorate(order);
  }

  /** Generic partial update used by shipOrder — shallow-merges nested
   *  objects (e.g. shipping, payment) instead of overwriting them. */
  async updateById(id, data) {
    const order = await this.repository.model.findById(id);
    if (!order) throw new AppError('Order not found', 404);

    Object.entries(data).forEach(([key, value]) => {
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        order[key] &&
        typeof order[key] === 'object'
      ) {
        order[key] = { ...(order[key].toObject?.() ?? order[key]), ...value };
      } else {
        order[key] = value;
      }
    });

    await order.save();
    return this.decorate(order);
  }
}

module.exports = new OrderService();