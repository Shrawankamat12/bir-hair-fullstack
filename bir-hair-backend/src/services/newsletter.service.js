const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { newsletterRepository } = require('../repositories');

class NewsletterService extends BaseService {
  constructor() {
    super(newsletterRepository, 'Subscription');
  }

  async subscribe(email) {
    const existing = await this.repository.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError("You're already subscribed!", 409);
    return this.repository.create({ email: email.toLowerCase() });
  }

  async listAll() {
    return this.repository.find({}, { sort: '-createdAt' });
  }

  async deleteById(id) {
    return this.repository.deleteById(id);
  }
}

module.exports = new NewsletterService();
