const BaseService = require('./base.service');
const { reviewRepository, productRepository } = require('../repositories');

class ReviewService extends BaseService {
  constructor() {
    super(reviewRepository, 'Review');
  }

  async getProductReviews(productId) {
    return this.repository.find({ product: productId, isApproved: true }, { sort: '-createdAt' });
  }

  async createReview(user, { productId, rating, comment, name }) {
    return this.repository.create({
      product: productId,
      rating,
      comment,
      user: user?._id,
      name: user?.name || name,
    });
  }

  decorate(reviewDoc) {
    const review = reviewDoc.toObject ? reviewDoc.toObject() : reviewDoc;
    return {
      ...review,
      customerName: review.name || review.user?.name || 'Anonymous',
      productName: review.product?.name || '',
    };
  }

  async listAllAdmin(filter = {}) {
    const reviews = await this.repository.find(filter, { populate: { path: 'product', select: 'name' }, sort: '-createdAt' });
    return reviews.map((r) => this.decorate(r));
  }

  /** Recomputes the product's aggregate rating/review count from approved reviews only. */
  async recomputeProductRating(productId) {
    const stats = await this.repository.aggregate([
      { $match: { product: productId, status: 'approved' } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await productRepository.updateById(productId, {
      rating: stats[0]?.avgRating?.toFixed(1) || 0,
      reviewsCount: stats[0]?.count || 0,
    });
  }

  /** General admin update — status changes (approve/reject), reply text, etc.
   *  Keeps the legacy `isApproved` flag (used by the storefront) in sync with `status`. */
  async updateAdmin(id, payload) {
    const body = { ...payload };
    if (body.status) body.isApproved = body.status === 'approved';
    const review = await this.updateById(id, body);
    await this.recomputeProductRating(review.product);
    return this.decorate(review);
  }

  async approve(id) {
    return this.updateAdmin(id, { status: 'approved' });
  }
}

module.exports = new ReviewService();
