import api from './axiosInstance';

// Creates { getAll, getOne, create, update, remove } bound to a base admin path
export default function crudApi(basePath) {
  return {
    getAll: (params) => api.get(basePath, { params }).then((r) => r.data),
    getOne: (id) => api.get(`${basePath}/${id}`).then((r) => r.data),
    create: (payload) => api.post(basePath, payload).then((r) => r.data),
    update: (id, payload) => api.put(`${basePath}/${id}`, payload).then((r) => r.data),
    remove: (id) => api.delete(`${basePath}/${id}`).then((r) => r.data),
  };
}
