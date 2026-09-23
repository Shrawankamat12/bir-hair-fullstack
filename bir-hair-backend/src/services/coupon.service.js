const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { couponRepository } = require('../repositories');

class CouponService extends BaseService {
  constructor() {
    super(couponRepository, 'Coupon');
  }

  /** Admin sends `status` (bool) + `endDate`; storefront/validity logic uses `isActive` + `expiresAt`. */
  normalize(payload) {
    const body = { ...payload };
    if (typeof body.status === 'boolean') { body.isActive = body.status; delete body.status; }
    if (body.endDate) { body.expiresAt = body.endDate; }
    return body;
  }

  async create(payload) {
    return this.repository.create(this.normalize(payload));
  }

  async updateById(id, payload) {
    return super.updateById(id, this.normalize(payload));
  }

  /** Shared validity + discount-amount calculation, used by both apply() (preview) and redeem() (commit). */
  async _validateAndPrice(code, subtotal) {
    const coupon = await this.repository.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw new AppError('Invalid coupon code', 404);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError('Coupon expired', 400);
    if (subtotal < coupon.minOrderValue) {
      throw new AppError(`Minimum order value ₹${coupon.minOrderValue} required`, 400);
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit reached', 400);
    }

    let discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    return { coupon, discount: Math.round(discount) };
  }

  /**
   * Cart/checkout preview — validates the code and returns the discount
   * amount WITHOUT consuming a usage slot. A coupon typed into the cart
   * and never checked out must not burn the customer's (or anyone else's)
   * usage limit; that only happens once an order is actually placed, via
   * redeem() below.
   */
  async apply(code, subtotal) {
    const { coupon, discount } = await this._validateAndPrice(code, subtotal);
    return { code: coupon.code, discount };
  }

  /**
   * Commits one usage of the coupon. Called from order.service.createOrder()
   * right after an order is successfully placed with this coupon — this is
   * the only place usedCount/usageHistory should change.
   */
  async redeem(code, subtotal, user) {
    const { coupon, discount } = await this._validateAndPrice(code, subtotal);

    coupon.usedCount = (coupon.usedCount || 0) + 1;
    coupon.usageHistory = coupon.usageHistory || [];
    coupon.usageHistory.push({ user: user?._id, customerName: user?.name || 'Guest', usedAt: new Date() });
    await coupon.save();

    return { code: coupon.code, discount };
  }

  async listAll() {
    return this.repository.find({}, { sort: '-createdAt' });
  }
}

module.exports = new CouponService();
