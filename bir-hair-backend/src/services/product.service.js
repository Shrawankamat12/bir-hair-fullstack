const slugify = require('slugify');
const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { productRepository } = require('../repositories');

class ProductService extends BaseService {
  constructor() {
    super(productRepository, 'Product');
  }

  async listPublic(queryString) {
    // $ne: 'hidden' (not $eq: 'visible') so products saved before the
    // `visibility` field existed — where it's undefined — still show up.
    return this.repository.list({ isActive: true, visibility: { $ne: 'hidden' } }, queryString, {
      populate: { path: 'category', select: 'name slug' },
      searchFields: ['name', 'sku'],
    });
  }

  /** Admin panel sees every product (active + inactive), unpaginated by default so the
   *  reusable EntityListPage table can do client-side search/sort/pagination. */
  async listAdmin(queryString = {}) {
    return this.repository.find({}, { sort: '-createdAt', populate: { path: 'category', select: 'name slug' } });
  }

  async getByIdOrSlug(idOrSlug) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    const product = await this.repository.findOne(filter, {
      populate: { path: 'category', select: 'name slug' },
    });
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  /**
   * The admin panel (see bir-hair-admin) posts a slightly different field
   * shape than the original storefront schema — this reconciles the two
   * without touching any existing storefront field or behavior.
   */
  normalize(payload) {
    const body = { ...payload };
    if (body.categoryId) { body.category = body.categoryId; delete body.categoryId; }
    if (body.subcategoryId) { body.subcategory = body.subcategoryId; delete body.subcategoryId; }
    if (body.collectionId) { body.collectionRef = body.collectionId; delete body.collectionId; }
    if (body.brandId) { body.brand = body.brandId; delete body.brandId; }
    ['subcategory', 'collectionRef', 'brand'].forEach((k) => { if (body[k] === '') delete body[k]; });
    if (typeof body.status === 'boolean') { body.isActive = body.status; delete body.status; }
    if (Array.isArray(body.gallery)) {
      body.images = body.gallery.map((g) => (typeof g === 'string' ? g : g.url)).filter(Boolean);
    }
    // Admin "Price" = MRP, admin "Discount Price" = actual selling price.
    // Guarded so this is a no-op if normalizeProductBody middleware already ran (mrp already set).
    if (body.mrp === undefined && body.price !== undefined && body.price !== '') {
      const mrp = Number(body.price);
      const sell = body.discountPrice !== undefined && body.discountPrice !== '' ? Number(body.discountPrice) : mrp;
      body.mrp = mrp;
      body.price = sell;
      body.discountPct = mrp > 0 ? Math.round(((mrp - sell) / mrp) * 100) : 0;
    } else if (body.mrp !== undefined && body.discountPct === undefined) {
      const mrp = Number(body.mrp);
      const sell = Number(body.price ?? mrp);
      body.discountPct = mrp > 0 ? Math.round(((mrp - sell) / mrp) * 100) : 0;
    }
    return body;
  }

  async create(payload) {
    const body = { ...this.normalize(payload), slug: slugify(payload.name, { lower: true, strict: true }) };
    return this.repository.create(body);
  }

  async updateById(id, payload) {
    const body = this.normalize(payload);
    if (body.name) body.slug = slugify(body.name, { lower: true, strict: true });
    return super.updateById(id, body, { new: true, runValidators: true });
  }

  async getByBadge(badge) {
    return this.repository.find({ badge, isActive: true });
  }

  /** Home-page shelves: /products/flag/:flag where flag is one of the
   *  boolean shelf fields on Product (newArrival, trending, premium,
   *  bestSeller, flashSale, recommended, featured). */
  static SHELF_FLAGS = ['newArrival', 'trending', 'premium', 'bestSeller', 'flashSale', 'recommended', 'featured'];

  async getByFlag(flag, limit = 12) {
    if (!ProductService.SHELF_FLAGS.includes(flag)) {
      throw new AppError(`Unknown product flag: ${flag}`, 400);
    }
    const filter = { isActive: true, visibility: { $ne: 'hidden' }, [flag]: true };
    if (flag === 'flashSale') {
      // Only show flash-sale items that haven't expired (or have no end date set).
      filter.$or = [{ flashSaleEndsAt: { $exists: false } }, { flashSaleEndsAt: null }, { flashSaleEndsAt: { $gte: new Date() } }];
    }
    return this.repository.find(filter, {
      populate: { path: 'category', select: 'name slug' },
      sort: '-createdAt',
      limit,
    });
  }
}

module.exports = new ProductService();
