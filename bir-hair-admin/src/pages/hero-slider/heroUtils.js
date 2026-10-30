// Shared constants + client-side validation for the Hero Slider page.
// The backend (validators/heroSlider.validator.js) is the source of truth;
// these checks only give instant feedback before a save round-trip.

export const SLIDE_META = {
  'existing-hero': {
    label: 'Existing hero',
    help: 'Your original homepage hero. Its text, image and buttons are edited in Website Content → Hero Banner.',
  },
  'image-video-image': {
    label: 'Image · Video · Image',
    help: 'A large video that plays by itself (muted — visitors can turn sound on). Left and right images are optional: they appear only when you add one; leave both empty to show the video alone.',
  },
  'content-gallery': {
    label: 'Content + hair images',
    help: 'Heading, text and button beside a mosaic of up to 6 hair photos.',
  },
  'instagram-single': {
    label: 'Instagram Reel',
    help: 'One featured Instagram Reel shown as a portrait video card.',
  },
  'instagram-multi': {
    label: 'Instagram videos',
    help: 'A row of portrait Instagram video cards that scrolls on small screens.',
  },
};

export const LIMITS = { title: 160, description: 600, ctaLabel: 40, mediaText: 160, minSec: 3, maxSec: 30 };
export const MAX_MEDIA = { 'content-gallery': 6, 'instagram-multi': 8, 'instagram-single': 1 };

const UNSAFE = /[\s\u0000-\u001f\u007f\\]/;
const IG_PATH = /^\/(?:[A-Za-z0-9_.]{1,30}\/)?(?:reel|reels|p|tv)\/[A-Za-z0-9_-]{5,40}\/?$/;

export function isSafeUrl(v) {
  if (!v || UNSAFE.test(v)) return false;
  if (v.startsWith('/')) return !v.startsWith('//');
  try {
    const u = new URL(v);
    return (u.protocol === 'http:' || u.protocol === 'https:') && !u.username && !u.password;
  } catch {
    return false;
  }
}

export function isInstagramUrl(v) {
  if (!v || UNSAFE.test(v)) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(u.hostname.toLowerCase()) && IG_PATH.test(u.pathname);
  } catch {
    return false;
  }
}

let seq = 0;
export const uid = () => `k${Date.now().toString(36)}${(seq += 1)}`;

export const blankMedia = (mediaType, extra = {}) => ({
  _k: uid(), mediaType, url: '', thumbnail: '', alt: '', title: '', enabled: true, ...extra,
});

// Server config -> editable draft (adds React keys; guarantees the 3 fixed slots on slide 2).
export function toDraft(cfg) {
  return {
    version: cfg.version,
    enabled: cfg.enabled,
    autoplay: cfg.autoplay,
    autoplayInterval: cfg.autoplayInterval,
    slides: (cfg.slides || []).map((s) => {
      let media = (s.media || []).map((m) => ({ ...m, _k: uid() }));
      if (s.slideType === 'image-video-image') {
        const imgs = media.filter((m) => m.mediaType === 'image');
        const vid = media.find((m) => m.mediaType === 'video');
        media = [
          imgs[0] || blankMedia('image', { title: 'Left image' }),
          vid || blankMedia('video', { title: 'Center video' }),
          imgs[1] || blankMedia('image', { title: 'Right image' }),
        ];
      }
      return { ...s, media };
    }),
  };
}

// Draft -> API payload. `order` is always renumbered to match on-screen position.
export function toPayload(d) {
  return {
    version: d.version,
    enabled: d.enabled,
    autoplay: d.autoplay,
    autoplayInterval: d.autoplayInterval,
    slides: d.slides.map((s, si) => ({
      slideType: s.slideType,
      title: s.title || '',
      description: s.description || '',
      ctaLabel: s.ctaLabel || '',
      ctaUrl: s.ctaUrl || '',
      enabled: s.enabled !== false,
      order: si,
      media: s.slideType === 'existing-hero'
        ? []
        : s.media.map((m, mi) => ({
            mediaType: m.mediaType,
            url: (m.url || '').trim(),
            thumbnail: (m.thumbnail || '').trim(),
            alt: m.alt || '',
            title: m.title || '',
            enabled: m.enabled !== false,
            order: mi,
          })),
    })),
  };
}

// path -> message, using the same paths the server reports (slides[0].media[1].url …)
export function validateDraft(d) {
  const e = {};
  const sec = Number(d.autoplayInterval) / 1000;
  if (!Number.isFinite(sec) || sec < LIMITS.minSec || sec > LIMITS.maxSec) {
    e.autoplayInterval = `Use between ${LIMITS.minSec} and ${LIMITS.maxSec} seconds`;
  }
  if (d.enabled && !d.slides.some((s) => s.enabled !== false)) e.slides = 'Enable at least one slide, or turn off the hero section';

  d.slides.forEach((s, si) => {
    if (s.slideType === 'existing-hero') return;
    const p = `slides[${si}]`;
    if ((s.title || '').length > LIMITS.title) e[`${p}.title`] = `Max ${LIMITS.title} characters`;
    if ((s.description || '').length > LIMITS.description) e[`${p}.description`] = `Max ${LIMITS.description} characters`;
    if ((s.ctaLabel || '').length > LIMITS.ctaLabel) e[`${p}.ctaLabel`] = `Max ${LIMITS.ctaLabel} characters`;
    if (s.ctaUrl && !isSafeUrl(s.ctaUrl.trim())) e[`${p}.ctaUrl`] = 'Use a path like /shop or a full https:// link';
    if (s.ctaUrl && !s.ctaLabel) e[`${p}.ctaLabel`] = 'Add a label for the button';
    if (s.ctaLabel && !s.ctaUrl) e[`${p}.ctaUrl`] = 'Add a link for the button';
    s.media.forEach((m, mi) => {
      const mp = `${p}.media[${mi}]`;
      const url = (m.url || '').trim();
      const thumb = (m.thumbnail || '').trim();
      if (thumb && !isSafeUrl(thumb)) e[`${mp}.thumbnail`] = 'Upload an image or use a full https:// link';
      if (m.mediaType === 'instagram') {
        if (!url && m.enabled !== false) e[`${mp}.url`] = 'Instagram link required (or switch this card off)';
        else if (url && !isInstagramUrl(url)) e[`${mp}.url`] = 'Must look like https://www.instagram.com/reel/… or /p/…';
      } else if (url && !isSafeUrl(url)) {
        e[`${mp}.url`] = 'Upload a file or use a full https:// link';
      }
    });
  });
  return e;
}