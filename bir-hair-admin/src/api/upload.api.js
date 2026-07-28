import api from './axiosInstance';

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  // Backend returns {success, data: {url, publicId?}} — unwrap to the plain result.
  return api.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.data);
};
