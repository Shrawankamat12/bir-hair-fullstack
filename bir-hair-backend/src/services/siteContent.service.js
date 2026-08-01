const { siteContentRepository } = require('../repositories');

class SiteContentService {
  async get() {
    let content = await siteContentRepository.model.findOne();
    if (!content) content = await siteContentRepository.create({});
    return content;
  }

  async update(payload) {
    let content = await siteContentRepository.model.findOne();
    if (!content) content = await siteContentRepository.create(payload);
    else content = await siteContentRepository.updateById(content._id, payload);
    return content;
  }
}

module.exports = new SiteContentService();
