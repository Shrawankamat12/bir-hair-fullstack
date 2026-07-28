const BaseService = require('./base.service');
const { wishlistRepository } = require('../repositories');

class WishlistService extends BaseService {
  constructor() {
    super(wishlistRepository, 'Wishlist');
  }

  async getOrCreate(userId) {
    let wishlist = await this.repository.findOne({ user: userId }, { populate: 'products' });
    if (!wishlist) wishlist = await this.repository.create({ user: userId, products: [] });
    return wishlist;
  }

  async toggle(userId, productId) {
    let wishlist = await this.repository.model.findOne({ user: userId });
    if (!wishlist) wishlist = new this.repository.model({ user: userId, products: [] });

    const exists = wishlist.products.some((p) => p.toString() === productId);
    wishlist.products = exists
      ? wishlist.products.filter((p) => p.toString() !== productId)
      : [...wishlist.products, productId];

    await wishlist.save();
    return wishlist;
  }
}

module.exports = new WishlistService();
