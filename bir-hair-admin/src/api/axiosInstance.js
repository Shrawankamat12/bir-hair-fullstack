import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // send httpOnly cookie
});

// fallback: also attach bearer token if stored (in case cookies are blocked cross-site)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bir_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bir_admin_token');
      // Avoid an infinite reload loop: only force-navigate when we're not
      // already on the login page (getMe() on the login page itself will
      // also 401 for a logged-out visitor — that's expected, not an error).
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;