// crudFactory.js
import api from './axiosInstance';

export default function crudApi(basePath) {
  const unwrap = (r) => r.data?.data ?? r.data;
  return {
    getAll: (params) => api.get(basePath, { params }).then(unwrap),
    getOne: (id) => api.get(`${basePath}/${id}`).then(unwrap),
    create: (payload) => api.post(basePath, payload).then(unwrap),
    update: (id, payload) => api.put(`${basePath}/${id}`, payload).then(unwrap),
    remove: (id) => api.delete(`${basePath}/${id}`).then(unwrap),
  };
}