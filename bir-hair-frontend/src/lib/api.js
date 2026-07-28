const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
  del: (path) => request(path, { method: 'DELETE' }),
};

export { ApiError, BASE_URL };
