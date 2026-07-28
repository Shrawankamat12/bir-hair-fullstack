import api from './axiosInstance';

const inventoryApi = {
  list: (params) => api.get('/admin/inventory', { params }).then((r) => r.data),
  adjust: (productId, payload) => api.post(`/admin/inventory/${productId}/adjust`, payload).then((r) => r.data),
  history: (productId) => api.get(`/admin/inventory/${productId}/history`).then((r) => r.data),
};
export default inventoryApi;
