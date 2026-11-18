const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Server origin without the '/api/v1' suffix — used for static file URLs like /uploads/xyz.png
const SERVER_ORIGIN = BASE_URL.replace(/\/api\/v1\/?$/, '');

const UPLOAD_PATH_RE = /^\/?uploads\/\S+$/i;

const LOCAL_UPLOAD_URL_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/\S+)$/i;

// Walks any JSON payload and turns every upload path into a full, loadable URL,
// so no component ever has to remember to resolve image URLs itself.
function absolutizeUploads(value) {
  if (typeof value === 'string') {
    const str = value.trim();
    if (UPLOAD_PATH_RE.test(str)) return `${SERVER_ORIGIN}${str.startsWith('/') ? '' : '/'}${str}`;
    const local = str.match(LOCAL_UPLOAD_URL_RE);
    if (local) return `${SERVER_ORIGIN}${local[3]}`;
    return value;
  }
  if (Array.isArray(value)) return value.map(absolutizeUploads);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = absolutizeUploads(value[k]);
    return out;
  }
  return value;
}

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}


async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${BASE_URL}${path}`;

  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // no JSON body (e.g. 204)
  }

  if (!res.ok) {
    throw new ApiError(payload?.message || 'Something went wrong', res.status, payload?.errors);
  }

  return absolutizeUploads(payload);
}

export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path, params) =>
  request(path, {
    method: 'DELETE',
    params,
  }),
};


export function resolveImageUrl(image) {
  if (!image || typeof image !== 'string') return null;
  const img = image.trim();
  const local = img.match(LOCAL_UPLOAD_URL_RE);
  if (local) return `${SERVER_ORIGIN}${local[3]}`;
  if (/^(https?:)?\/\//i.test(img) || img.startsWith('data:') || img.startsWith('blob:')) return img;
  // Backend-served files: "/uploads/x.png" or "uploads/x.png"
  if (/^\/?uploads\//i.test(img)) {
    return `${SERVER_ORIGIN}${img.startsWith('/') ? '' : '/'}${img}`;
  }
  
  return img;
}

export { ApiError, BASE_URL };