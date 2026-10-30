const { siteContentRepository } = require('../repositories');

// `heroSlider` is owned by heroSlider.service.js (/admin/hero-slider). It is excluded
// from every read here and stripped from every write, because the Website Content
// editor saves the whole document back — without this a stale copy would overwrite it.
const WITHOUT_HERO_SLIDER = { heroSlider: 0 };

class SiteContentService {
  async get() {
    let content = await siteContentRepository.model.findOne().select(WITHOUT_HERO_SLIDER);
    if (!content) {
      await siteContentRepository.create({});
      content = await siteContentRepository.model.findOne().select(WITHOUT_HERO_SLIDER);
    }
    return content;
  }

  async update(payload) {
    // eslint-disable-next-line no-unused-vars
    const { heroSlider, ...rest } = payload || {};

    const current = await siteContentRepository.model.findOne().select('_id');
    if (!current) await siteContentRepository.create(rest);
    else await siteContentRepository.updateById(current._id, rest);

    return siteContentRepository.model.findOne().select(WITHOUT_HERO_SLIDER);
  }
}

module.exports = new SiteContentService();