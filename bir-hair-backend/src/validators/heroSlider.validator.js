const AppError = require('../utils/AppError');
const {
  SLIDE_TYPES,
  HERO_SLIDE_TYPES,
  MEDIA_TYPES,
  SLIDE_RULES,
  LIMITS,
} = require('../constants/heroSlider');

// Whitelist-based sanitizer for the hero slider payload. Anything not listed
// here is dropped, every URL is checked, and order values are re-derived from the
// array position — so the stored document is always well-formed regardless of
// what the client sent.

const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com']);
// /reel/<code>/, /reels/<code>/, /p/<code>/, /tv/<code>/ and the /<user>/reel/<code>/ variants
const INSTAGRAM_PATH = /^\/(?:[A-Za-z0-9_.]{1,30}\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]{5,40})\/?$/;
const UNSAFE_CHARS = /[\s\u0000-\u001f\u007f\\]/;

function parseHttpUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (u.username || u.password) return null;
    return u;
  } catch {
    return null;
  }
}

// Relative path ("/uploads/x.jpg", "/shop") or absolute http(s) URL.
// Rejects javascript:, data:, protocol-relative (//host) and anything with whitespace.
function isSafeUrl(value) {
  if (typeof value !== 'string' || !value || value.length > LIMITS.url) return false;
  if (UNSAFE_CHARS.test(value)) return false;
  if (value.startsWith('/')) return !value.startsWith('//');
  return parseHttpUrl(value) !== null;
}

function isInstagramUrl(value) {
  if (typeof value !== 'string' || !value || value.length > LIMITS.url) return false;
  if (UNSAFE_CHARS.test(value)) return false;
  const u = parseHttpUrl(value);
  if (!u || u.protocol !== 'https:') return false;
  if (!INSTAGRAM_HOSTS.has(u.hostname.toLowerCase())) return false;
  return INSTAGRAM_PATH.test(u.pathname);
}

function sortByOrder(items) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const ao = Number.isFinite(a.item?.order) ? a.item.order : a.index;
      const bo = Number.isFinite(b.item?.order) ? b.item.order : b.index;
      return ao - bo || a.index - b.index;
    })
    .map(({ item }) => item);
}

function validateHeroSlider(input) {
  const errors = [];
  const fail = (field, message) => errors.push({ field, message });

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { value: null, errors: [{ field: 'heroSlider', message: 'A hero slider object is required' }] };
  }

  const text = (raw, max, field, label) => {
    if (raw === undefined || raw === null) return '';
    if (typeof raw !== 'string') {
      fail(field, `${label} must be text`);
      return '';
    }
    const v = raw.trim();
    if (v.length > max) fail(field, `${label} must be ${max} characters or fewer`);
    return v;
  };

  const bool = (raw, fallback, field, label) => {
    if (raw === undefined) return fallback;
    if (typeof raw !== 'boolean') {
      fail(field, `${label} must be true or false`);
      return fallback;
    }
    return raw;
  };

  const enabled = bool(input.enabled, true, 'enabled', 'Hero section enabled');
  const autoplay = bool(input.autoplay, true, 'autoplay', 'Autoplay');

  let autoplayInterval = LIMITS.autoplayDefault;
  if (input.autoplayInterval !== undefined) {
    const n = input.autoplayInterval;
    if (!Number.isInteger(n) || n < LIMITS.autoplayMin || n > LIMITS.autoplayMax) {
      fail(
        'autoplayInterval',
        `Autoplay interval must be a whole number between ${LIMITS.autoplayMin} and ${LIMITS.autoplayMax} milliseconds`
      );
    } else {
      autoplayInterval = n;
    }
  }

  if (!Array.isArray(input.slides) || input.slides.length === 0) {
    fail('slides', 'At least one slide is required');
    return { value: null, errors };
  }
  if (input.slides.length > HERO_SLIDE_TYPES.length) {
    fail('slides', `A maximum of ${HERO_SLIDE_TYPES.length} slides is allowed`);
    return { value: null, errors };
  }

  const seenTypes = new Set();
  const slides = [];

  sortByOrder(input.slides).forEach((rawSlide, si) => {
    const p = `slides[${si}]`;
    if (!rawSlide || typeof rawSlide !== 'object') {
      fail(p, 'Slide must be an object');
      return;
    }

    const slideType = rawSlide.slideType;
    if (!HERO_SLIDE_TYPES.includes(slideType)) {
      fail(`${p}.slideType`, `Slide type must be one of: ${HERO_SLIDE_TYPES.join(', ')}`);
      return;
    }
    if (seenTypes.has(slideType)) {
      fail(`${p}.slideType`, `Only one "${slideType}" slide is allowed`);
      return;
    }
    seenTypes.add(slideType);

    const slide = {
      slideType,
      title: '',
      description: '',
      ctaLabel: '',
      ctaUrl: '',
      media: [],
      order: slides.length,
      enabled: bool(rawSlide.enabled, true, `${p}.enabled`, 'Slide enabled'),
    };

    // Slide 1 is the storefront's original hero — its content is managed in
    // Website Content. Whatever text/media a client sends for it is ignored.
    if (slideType === SLIDE_TYPES.EXISTING) {
      slides.push(slide);
      return;
    }

    slide.title = text(rawSlide.title, LIMITS.title, `${p}.title`, 'Heading');
    slide.description = text(rawSlide.description, LIMITS.description, `${p}.description`, 'Description');
    slide.ctaLabel = text(rawSlide.ctaLabel, LIMITS.ctaLabel, `${p}.ctaLabel`, 'Button label');
    slide.ctaUrl = text(rawSlide.ctaUrl, LIMITS.url, `${p}.ctaUrl`, 'Button link');

    if (slide.ctaUrl && !isSafeUrl(slide.ctaUrl)) {
      fail(`${p}.ctaUrl`, 'Button link must be a path like /shop or a full http(s) URL');
    }
    if (slide.ctaUrl && !slide.ctaLabel) fail(`${p}.ctaLabel`, 'Button label is required when a button link is set');
    if (slide.ctaLabel && !slide.ctaUrl) fail(`${p}.ctaUrl`, 'Button link is required when a button label is set');

    const rawMedia = rawSlide.media === undefined ? [] : rawSlide.media;
    if (!Array.isArray(rawMedia)) {
      fail(`${p}.media`, 'Media must be a list');
      slides.push(slide);
      return;
    }

    const rules = SLIDE_RULES[slideType];
    if (rawMedia.length > rules.maxTotal) {
      fail(`${p}.media`, `This slide type allows at most ${rules.maxTotal} media item(s)`);
    }

    const counts = {};
    sortByOrder(rawMedia).slice(0, rules.maxTotal).forEach((m, mi) => {
      const mp = `${p}.media[${mi}]`;
      if (!m || typeof m !== 'object') {
        fail(mp, 'Media item must be an object');
        return;
      }
      const mediaType = m.mediaType;
      if (!MEDIA_TYPES.includes(mediaType)) {
        fail(`${mp}.mediaType`, `Media type must be one of: ${MEDIA_TYPES.join(', ')}`);
        return;
      }
      const max = rules.maxByType[mediaType];
      if (!max) {
        fail(`${mp}.mediaType`, `A "${slideType}" slide cannot contain ${mediaType} media`);
        return;
      }
      counts[mediaType] = (counts[mediaType] || 0) + 1;
      if (counts[mediaType] > max) {
        fail(`${mp}.mediaType`, `This slide type allows at most ${max} ${mediaType} item(s)`);
        return;
      }

      const item = {
        mediaType,
        url: text(m.url, LIMITS.url, `${mp}.url`, 'URL'),
        thumbnail: text(m.thumbnail, LIMITS.url, `${mp}.thumbnail`, 'Thumbnail'),
        alt: text(m.alt, LIMITS.mediaText, `${mp}.alt`, 'Alt text'),
        title: text(m.title, LIMITS.mediaText, `${mp}.title`, 'Title'),
        order: slide.media.length,
        enabled: bool(m.enabled, true, `${mp}.enabled`, 'Media enabled'),
      };

      if (item.thumbnail && !isSafeUrl(item.thumbnail)) {
        fail(`${mp}.thumbnail`, 'Thumbnail must be an uploaded image path or a full http(s) URL');
      }

      if (mediaType === 'instagram') {
        if (!item.url) {
          if (item.enabled) fail(`${mp}.url`, 'Instagram URL is required (or disable this item)');
        } else if (!isInstagramUrl(item.url)) {
          fail(`${mp}.url`, 'Must be an https://www.instagram.com/reel/…, /p/… or /tv/… link');
        }
      } else if (item.url && !isSafeUrl(item.url)) {
        fail(`${mp}.url`, 'URL must be an uploaded file path or a full http(s) URL');
      }

      slide.media.push(item);
    });

    slides.push(slide);
  });

  if (!seenTypes.has(SLIDE_TYPES.EXISTING)) {
    fail('slides', 'The existing hero slide (Slide 1) cannot be removed');
  }
  if (enabled && slides.length && !slides.some((s) => s.enabled)) {
    fail('slides', 'Enable at least one slide, or turn off the whole hero section');
  }

  if (errors.length) return { value: null, errors };
  return { value: { enabled, autoplay, autoplayInterval, slides }, errors: [] };
}

// Throwing wrapper used by the service layer — produces the same 422 shape as
// middleware/validate.middleware.js ({ success:false, message, errors:[{field,message}] }).
function sanitizeHeroSlider(input) {
  const { value, errors } = validateHeroSlider(input);
  if (errors.length) throw new AppError('Validation failed', 422, errors);
  return value;
}

module.exports = {
  validateHeroSlider,
  sanitizeHeroSlider,
  isSafeUrl,
  isInstagramUrl,
};