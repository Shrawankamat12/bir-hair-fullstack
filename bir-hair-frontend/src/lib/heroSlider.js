import { resolveImageUrl } from './api';

// Slide types — must match bir-hair-backend/src/constants/heroSlider.js
export const SLIDE = Object.freeze({
  EXISTING: 'existing-hero',
  IMAGE_VIDEO_IMAGE: 'image-video-image',
  CONTENT_GALLERY: 'content-gallery',
  INSTAGRAM_SINGLE: 'instagram-single',
  INSTAGRAM_MULTI: 'instagram-multi',
});

const KNOWN = new Set(Object.values(SLIDE));
const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com']);
const INSTAGRAM_PATH = /^\/(?:[A-Za-z0-9_.]{1,30}\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]{5,40})\/?$/;

// Only relative paths or http(s) URLs ever reach an <img>/<video>/<a>.
export function safeUrl(value) {
  if (typeof value !== 'string') return '';
  const v = value.trim();
  if (!v || /[\s\\]/.test(v)) return '';
  if (v.startsWith('/')) return v.startsWith('//') ? '' : v;
  return /^https?:\/\//i.test(v) ? v : '';
}

// Builds the (constructed, never user-supplied) embed URL from a validated
// instagram.com link. Returns null for anything that is not a public post/reel URL.
export function parseInstagramUrl(url) {
  if (typeof url !== 'string') return null;
  const href = url.trim();
  let u;
  try {
    u = new URL(href);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' || u.username || u.password) return null;
  if (!INSTAGRAM_HOSTS.has(u.hostname.toLowerCase())) return null;
  const m = u.pathname.match(INSTAGRAM_PATH);
  if (!m) return null;
  const kind = m[1] === 'reels' ? 'reel' : m[1];
  return {
    kind,
    shortcode: m[2],
    href, // exactly as supplied (query string preserved)
    embedUrl: `https://www.instagram.com/${kind}/${m[2]}/embed/`,
  };
}

export function isExternalUrl(url) {
  return /^https?:\/\//i.test(url || '');
}

/**
 * Turns the public /hero-slider response into what the carousel renders.
 *  - 'legacy'   : not configured / request failed → only the original hero (no carousel UI)
 *  - 'hidden'   : admin switched the hero section off
 *  - 'carousel' : ordered, sanitised slides
 */
export function buildHeroModel(data, error) {
  if (error || !data || !data.configured) return { mode: 'legacy' };
  if (data.enabled === false) return { mode: 'hidden' };

  const slides = (Array.isArray(data.slides) ? data.slides : [])
    .filter((s) => s && KNOWN.has(s.slideType))
    .map((s) => {
      const media = (Array.isArray(s.media) ? s.media : [])
        .map((m) => {
          const base = {
            mediaType: m.mediaType,
            url: safeUrl(m.url),
            thumbnail: resolveImageUrl(safeUrl(m.thumbnail)) || '',
            alt: m.alt || '',
            title: m.title || '',
          };
          if (m.mediaType === 'image') return { ...base, url: resolveImageUrl(base.url) || '' };
          if (m.mediaType === 'instagram') {
            const info = parseInstagramUrl(m.url);
            return info ? { ...base, url: info.href, instagram: info } : null;
          }
          return base; // video: resolved at play time (YouTube/Vimeo/file)
        })
        .filter(Boolean);
      return {
        key: s.slideType,
        type: s.slideType,
        title: s.title || '',
        description: s.description || '',
        ctaLabel: s.ctaLabel || '',
        ctaUrl: safeUrl(s.ctaUrl),
        media,
      };
    })
    .filter((s) => s.type === SLIDE.EXISTING || s.media.length > 0);

  if (!slides.length) return { mode: 'legacy' };
  const interval = Number(data.autoplayInterval);
  return {
    mode: 'carousel',
    slides,
    autoplay: data.autoplay !== false,
    interval: Number.isFinite(interval) && interval >= 3000 ? interval : 6000,
  };
}