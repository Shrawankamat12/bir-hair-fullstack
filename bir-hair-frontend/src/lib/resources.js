import { api } from './api';

export const authApi = {
  me: () => api.get('/auth/me'),
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
};

export const productsApi = {
  list: (query) => api.get('/products', query),
  get: (idOrSlug) => api.get(`/products/${idOrSlug}`),
  byBadge: (badge) => api.get(`/products/badge/${encodeURIComponent(badge)}`),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
};

export const blogsApi = {
  list: (category) => api.get('/blogs', category ? { category } : undefined),
  get: (slug) => api.get(`/blogs/${slug}`),
};

export const faqsApi = {
  list: () => api.get('/faqs'),
};

export const testimonialsApi = {
  list: () => api.get('/testimonials'),
};

export const bannersApi = {
  list: (placement) => api.get('/banners', placement ? { placement } : undefined),
};

export const reviewsApi = {
  forProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (payload) => api.post('/reviews', payload),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId, qty = 1) => api.post('/cart', { productId, qty }),
  update: (productId, qty) => api.put(`/cart/${productId}`, { qty }),
  remove: (productId) => api.del(`/cart/${productId}`),
};

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  toggle: (productId) => api.post('/wishlist/toggle', { productId }),
};

export const couponsApi = {
  apply: (code, subtotal) => api.post('/coupons/apply', { code, subtotal }),
};

export const ordersApi = {
  create: (payload) => api.post('/orders', payload),
  mine: () => api.get('/orders/my'),
  get: (idOrOrderNumber) => api.get(`/orders/${idOrOrderNumber}`),
};

export const paymentsApi = {
  status: () => api.get('/payments/razorpay/status'),
  createOrder: (orderId) => api.post('/payments/razorpay/order', { orderId }),
  verify: (payload) => api.post('/payments/razorpay/verify', payload),
};

export const usersApi = {
  updateProfile: (payload) => api.put('/users/profile', payload),
  addAddress: (payload) => api.post('/users/addresses', payload),
  updateAddress: (addressId, payload) => api.put(`/users/addresses/${addressId}`, payload),
  deleteAddress: (addressId) => api.del(`/users/addresses/${addressId}`),
};

export const contactApi = {
  submit: (payload) => api.post('/contact', payload),
};

export const wholesaleApi = {
  submit: (payload) => api.post('/wholesale', payload),
};

export const newsletterApi = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
};
