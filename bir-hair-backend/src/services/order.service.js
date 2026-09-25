const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { orderRepository, productRepository, inventoryLogRepository } = require('../repositories');
const generateOrderNumber = require('../utils/generateOrderNumber');
const settingService = require('./setting.service');
const couponService = require('./coupon.service');

// Order statuses that mean "the stock is really gone" vs statuses that
// mean "give it back". Used to decide whether a status change should
// restock inventory, and to make that restock idempotent.
const RESTOCK_STATUSES = ['cancelled', 'returned'];

class OrderService extends BaseService {
  constructor() {
    super(orderRepository, 'Order');
  }

  /** Reads the live Settings document and turns it into the shipping charge for this order. */
  async _computeShipping(shippingMethod, subtotal, settings) {
    if (shippingMethod === 'express') {
      return settings.expressShippingRate ?? 999;
    }
    const threshold = settings.freeShippingThreshold ?? 15000;
    const flatRate = settings.flatShippingRate ?? 15;
    return subtotal > threshold ? 0 : flatRate;
  }

  /**
   * Validates that every item has enough stock. Throws a 400 AppError
   * naming the first out-of-stock item if not — called before anything
   * is written, so a failed order never partially decrements stock.
   */
  async _assertStockAvailable(items) {
    for (const item of items) {
      const product = await productRepository.findById(item.productId);
      if (!product) throw new AppError(`Product not found: ${item.productName || item.productId}`, 404);
      if ((product.stock || 0) < item.quantity) {
        throw new AppError(
          `"${product.name}" only has ${product.stock || 0} in stock (you requested ${item.quantity})`,
          400
        );
      }
    }
  }

  /**
   * Atomically decrements stock for each item (guarded so it can never go
   * negative even under concurrent orders) and writes an InventoryLog entry
   * per product so the admin Inventory page shows exactly why stock moved.
   */
  async _decrementStock(items, orderId, userId) {
    for (const item of items) {
      const updated = await productRepository.model.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        // Someone else's order beat us to the remaining stock between the
        // pre-check and now — fail loudly instead of overselling silently.
        throw new AppError(`"${item.productName}" just went out of stock — please remove it and try again`, 409);
      }

      await inventoryLogRepository.create({
        product: item.productId,
        delta: -item.quantity,
        reason: 'order',
        stockAfter: updated.stock,
        adjustedBy: userId || undefined,
        order: orderId,
      }).catch(() => {}); // logging failure shouldn't fail the order
    }
  }

  /** Adds back stock for every item on an order — used when an order is cancelled/returned. */
  async _restockItems(order, userId) {
    for (const item of order.items || []) {
      const updated = await productRepository.model.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
      if (!updated) continue;

      await inventoryLogRepository.create({
        product: item.productId,
        delta: item.quantity,
        reason: 'return',
        stockAfter: updated.stock,
        adjustedBy: userId || undefined,
      }).catch(() => {});
    }
  }

  async createOrder(user, payload) {
    const {
      items,
      billingAddress,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      couponCode,
      orderSource = 'Website',
    } = payload;

    if (!items?.length) throw new AppError('Order must contain at least one item', 400);

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

    // Stock must be available BEFORE we touch the DB for real.
    await this._assertStockAvailable(processedItems);

    const subtotal = processedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const productDiscount = processedItems.reduce((sum, i) => sum + i.discount * i.quantity, 0);
    const netSubtotal = subtotal - productDiscount;

    // Coupon: re-validate server-side against the real subtotal (never trust
    // a client-supplied discount amount) and only NOW consume a usage slot —
    // a coupon typed into the cart and abandoned must not burn its limit.
    let couponDiscount = 0;
    if (couponCode) {
      const redeemed = await couponService.redeem(couponCode, netSubtotal, user);
      couponDiscount = redeemed.discount;
    }

    // Shipping + tax: read live from admin-configured Settings, not hardcoded numbers.
    const settings = await settingService.get();
    const taxableAmount = Math.max(0, netSubtotal - couponDiscount);
    const shippingCharge = await this._computeShipping(shippingMethod, taxableAmount, settings);
    const tax = Math.round((taxableAmount * (settings.taxRate || 0)) / 100);

    const grandTotal = taxableAmount + shippingCharge + tax;

    const order = await this.repository.create({
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
        couponCode: couponDiscount ? couponCode : undefined,
        couponDiscount,
        shippingCharge,
        tax,
        taxRate: settings.taxRate || 0,
        grandTotal,
      },

      payment: {
        // 'online' = Bluevine Payment Link, 'cod' = Cash on Delivery.
        // Status always starts as 'pending' — for online payments it stays
        // pending until an admin manually marks it "Paid" after confirming
        // the payment landed in the Bluevine account.
        method: paymentMethod || 'online',
        status: 'pending',
      },

      shipping: {
        method: shippingMethod || 'standard',
      },

      isCOD: paymentMethod === 'cod',
    });

    // Stock is only decremented once the order document actually exists,
    // so we always have an order to point the InventoryLog entries at.
    await this._decrementStock(processedItems, order._id, user?._id);

    return order;
  }

  async getMyOrders(userId) {
    return this.repository.find({ user: userId }, { sort: '-createdAt' });
  }

  /**
   * Looks up an order by its Mongo _id or human orderNumber.
   *
   * `requestingUser` (optional) is the logged-in user making the request, if any —
   * passed in from the `optionalAuth` middleware so this works for both guest
   * checkout (order placed with no `user`) and logged-in customers.
   *
   * Ownership rule: if the order belongs to a registered account (`order.user`
   * is set), only that same account may view it. Guest orders (`order.user`
   * is null) have no account to restrict to, so they remain reachable by
   * anyone who has the order id/number itself (the same behaviour the order
   * confirmation and guest tracking flows already rely on). Any mismatch is
   * reported as "Order not found" rather than "forbidden" so a logged-in user
   * probing another customer's order id can't use the response to confirm it
   * exists.
   *
   * Pass `{ bypassOwnership: true }` for internal/admin call sites (e.g. the
   * admin "ship order" action) where the caller has already been authorized
   * by admin middleware and isn't a storefront customer.
   */
  async getByIdOrOrderNumber(idOrNumber, requestingUser = null, { bypassOwnership = false } = {}) {
    const order = await this.repository.findOne({ $or: [{ _id: idOrNumber }, { orderNumber: idOrNumber }] });
    if (!order) throw new AppError('Order not found', 404);

    if (!bypassOwnership && order.user && (!requestingUser || String(order.user) !== String(requestingUser._id))) {
      throw new AppError('Order not found', 404);
    }

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

  async updateStatus(id, { status, orderStatus, trackingNumber, trackingId, paymentStatus }, userId) {
    const order = await this.repository.model.findById(id);
    if (!order) throw new AppError('Order not found', 404);

    const previousStatus = order.orderStatus;
    const nextStatus = orderStatus || status;

    if (nextStatus) order.orderStatus = nextStatus;
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

    // Auto-restock: only fires on the transition INTO cancelled/returned,
    // and only once — re-saving an already-cancelled order (e.g. adding a
    // tracking number) must not add the stock back a second time.
    const enteringRestockState = RESTOCK_STATUSES.includes(nextStatus) && previousStatus !== nextStatus;
    if (enteringRestockState) {
      await this._restockItems(order, userId);
    }

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