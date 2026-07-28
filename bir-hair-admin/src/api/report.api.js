import api from './axiosInstance';

// Each report endpoint returns {success, data: [...]}; unwrap so Reports.jsx gets the array directly.
const reportApi = {
  sales: (params) => api.get('/admin/reports/sales', { params }).then((r) => r.data.data),
  orders: (params) => api.get('/admin/reports/orders', { params }).then((r) => r.data.data),
  customers: (params) => api.get('/admin/reports/customers', { params }).then((r) => r.data.data),
  inventory: (params) => api.get('/admin/reports/inventory', { params }).then((r) => r.data.data),
  products: (params) => api.get('/admin/reports/products', { params }).then((r) => r.data.data),
};
export default reportApi;
