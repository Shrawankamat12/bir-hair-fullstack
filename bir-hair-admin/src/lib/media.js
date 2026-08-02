import api from '../api/axiosInstance.js';

// The API's baseURL includes a path suffix like /api/v1, but uploaded files
// are served from the backend's root (e.g. http://localhost:5000/uploads/...).
// Derive just the origin (protocol + host) once, and reuse it to resolve
// any relative /uploads/... path returned by the backend.
const ORIGIN = (() => {
  try {
    return new URL(api.defaults.baseURL).origin;
  } catch {
    return '';
  }
})();

/**
 * Resolves an image/video path coming from the backend into a full URL.
 * - Absolute URLs (http/https), blob: previews, and data: URIs pass through unchanged.
 * - Relative paths like "/uploads/xyz.jpg" get the backend origin prepended.
 */
export function resolveMediaUrl(url) {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}