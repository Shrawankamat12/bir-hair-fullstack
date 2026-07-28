import api from './axiosInstance';

// Every endpoint here returns {success, data}; unwrap consistently.
const mediaApi = {
  list: (params) => api.get('/admin/media', { params }).then((r) => r.data.data),
  upload: (file, folder = 'general') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    return api.post('/admin/media', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data);
  },
  remove: (id) => api.delete(`/admin/media/${id}`).then((r) => r.data),
  folders: () => api.get('/admin/media/folders').then((r) => r.data.data),
};
export default mediaApi;
