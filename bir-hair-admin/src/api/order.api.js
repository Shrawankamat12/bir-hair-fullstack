import crudApi from './crudFactory';
import api from './axiosInstance';

const orderApi = crudApi('/admin/orders');
orderApi.ship = (id) => api.post(`/admin/orders/${id}/ship`).then((r) => r.data);

export default orderApi;
