const { siteContentRepository } = require('../repositories');
const AppError = require('../utils/AppError');
const { sanitizeHeroSlider } = require('../validators/heroSlider.validator');
const { DEFAULT_HERO_SLIDER, SLIDE_TYPES, LIMITS } = require('../constants/heroSlider');



const Model = siteContentRepository.model;

async function getDoc() {
  let doc = await Model.findOne();
  if (!doc) doc = await Model.create({});
  return doc;
}

const byOrder = (a, b) => (a.order || 0) - (b.order || 0);

// Normalised, admin-facing view (includes disabled slides/media).
function toAdminView(doc) {
  const hs = (doc && doc.toObject ? doc.toObject().heroSlider : doc && doc.heroSlider) || {};
  const slides = (Array.isArray(hs.slides) ? hs.slides : [])
    .map((s) => ({ ...s, media: (Array.isArray(s.media) ? s.media : []).slice().sort(byOrder) }))
    .sort(byOrder);

  return {
    configured: slides.length > 0,
    enabled: hs.enabled !== false,
    autoplay: hs.autoplay !== false,
    autoplayInterval: hs.autoplayInterval || LIMITS.autoplayDefault,
    version: hs.version || 0,
    slides,
  };
}

// Public view: only active content, nothing the storefront doesn't need.
// `configured:false` tells the storefront to keep rendering just the original hero.
function toPublicView(admin) {
  if (!admin.configured) {
    return { configured: false, enabled: true, autoplay: false, autoplayInterval: admin.autoplayInterval, slides: [] };
  }
  if (!admin.enabled) {
    return { configured: true, enabled: false, autoplay: false, autoplayInterval: admin.autoplayInterval, slides: [] };
  }

  const slides = admin.slides
    .filter((s) => s.enabled !== false)
    .map((s) => ({
      slideType: s.slideType,
      title: s.title || '',
      description: s.description || '',
      ctaLabel: s.ctaLabel || '',
      ctaUrl: s.ctaUrl || '',
      order: s.order || 0,
      media: s.media
        .filter((m) => m.enabled !== false && (m.mediaType !== 'instagram' || m.url))
        .map((m) => ({
          mediaType: m.mediaType,
          url: m.url || '',
          thumbnail: m.thumbnail || '',
          alt: m.alt || '',
          title: m.title || '',
          order: m.order || 0,
        })),
    }))
    // A slide with every item switched off would render an empty frame — drop it.
    .filter((s) => s.slideType === SLIDE_TYPES.EXISTING || s.media.length > 0);

  return {
    configured: true,
    enabled: true,
    autoplay: admin.autoplay,
    autoplayInterval: admin.autoplayInterval,
    slides,
  };
}

class HeroSliderService {
  async getPublic() {
    const doc = await Model.findOne().select('heroSlider');
    return toPublicView(toAdminView(doc));
  }

  async getAdmin() {
    return toAdminView(await getDoc());
  }

  /**
   * Replace the hero config (validated + sanitised). Optimistic concurrency:
   * if the client sends the `version` it loaded, the write only succeeds when no
   * one else saved in between (409 otherwise), so two admins can't silently
   * overwrite each other.
   */
  async update(payload) {
    if (payload && payload.version !== undefined && !Number.isInteger(payload.version)) {
      throw new AppError('Validation failed', 422, [{ field: 'version', message: 'Version must be a whole number' }]);
    }

    const value = sanitizeHeroSlider(payload);
    const doc = await getDoc();
    const current = toAdminView(doc).version;
    const expected = payload.version !== undefined ? payload.version : current;

    const filter = { _id: doc._id };
    filter.$or = expected === 0
      ? [{ 'heroSlider.version': 0 }, { 'heroSlider.version': { $exists: false } }]
      : [{ 'heroSlider.version': expected }];

    const updated = await Model.findOneAndUpdate(
      filter,
      { $set: { heroSlider: { ...value, version: expected + 1 } } },
      { new: true, runValidators: true }
    );
    if (!updated) {
      throw new AppError('The hero slider was changed by someone else. Reload the page and try again.', 409);
    }
    return toAdminView(updated);
  }

  /**
   * Write the default five-slide configuration. Refuses (409) when a hero slider
   * already exists, so production data is never overwritten by accident.
   * `force` is only ever passed by the CLI script (`npm run seed:hero -- --force`).
   */
  async seedDefaults({ force = false } = {}) {
    const value = sanitizeHeroSlider(DEFAULT_HERO_SLIDER);
    const doc = await getDoc();
    const existing = toAdminView(doc);

    if (existing.configured && !force) {
      throw new AppError('The hero slider is already configured — nothing was changed.', 409);
    }

    const filter = { _id: doc._id };
    if (!force) {
      filter.$or = [{ 'heroSlider.slides': { $exists: false } }, { 'heroSlider.slides': { $size: 0 } }];
    }

    const updated = await Model.findOneAndUpdate(
      filter,
      { $set: { heroSlider: { ...value, version: existing.version + 1 } } },
      { new: true, runValidators: true }
    );
    if (!updated) throw new AppError('The hero slider was configured by someone else — nothing was changed.', 409);
    return toAdminView(updated);
  }
}

module.exports = new HeroSliderService();
module.exports.toAdminView = toAdminView;
module.exports.toPublicView = toPublicView;