const BASE_URL = import.meta.env.VITE_API_URL || 'https://bir-hair-fullstack.onrender.com/api/v1';

// Server origin without the '/api/v1' suffix — used for static file URLs like /uploads/xyz.png
const SERVER_ORIGIN = BASE_URL.replace(/\/api\/v1\/?$/, '');

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Thin fetch wrapper for the B.I.R Hair backend.
 * - Sends cookies (the backend sets the JWT as an httpOnly cookie on login).
 * - Unwraps the `{ success, data }` envelope every endpoint returns.
 * - Throws ApiError with the backend's message on any non-2xx response.
 */
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

  return payload;
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

// Resolves an image path returned by the backend (e.g. "/uploads/xyz.png")
// into a full URL. If the backend already sends a full http(s) URL, it's used as-is.
export function resolveImageUrl(image) {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  return `${SERVER_ORIGIN}${image}`;
}

export { ApiError, BASE_URL };