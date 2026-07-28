const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { cartRepository } = require('../repositories');

class CartService extends BaseService {
  constructor() {
    super(cartRepository, 'Cart');
  }

  async getOrCreate(userId) {
    let cart = await this.repository.findOne({ user: userId }, { populate: 'items.product' });
    if (!cart) cart = await this.repository.create({ user: userId, items: [] });
    return cart;
  }

  async addItem(userId, productId, qty = 1) {
    let cart = await this.repository.model.findOne({ user: userId });
    if (!cart) cart = new this.repository.model({ user: userId, items: [] });

    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (existing) existing.qty += qty;
    else cart.items.push({ product: productId, qty });

    await cart.save();
    return cart;
  }

  async updateItem(userId, productId, qty) {
    const cart = await this.repository.model.findOne({ user: userId });
    if (!cart) throw new AppError('Cart not found', 404);
    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) throw new AppError('Item not in cart', 404);
    item.qty = Math.max(1, qty);
    await cart.save();
    return cart;
  }

  async removeItem(userId, productId) {
    const cart = await this.repository.model.findOne({ user: userId });
    if (!cart) throw new AppError('Cart not found', 404);
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    return cart;
  }
}

module.exports = new CartService();
