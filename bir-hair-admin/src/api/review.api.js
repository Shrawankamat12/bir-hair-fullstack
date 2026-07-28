import crudApi from './crudFactory';
import api from './axiosInstance';

const reviewApi = crudApi('/admin/reviews');
reviewApi.reply = (id, message) => api.post(`/admin/reviews/${id}/reply`, { message }).then((r) => r.data);
export default reviewApi;
