import api from './axiosInstance';

// Both endpoints return {success, data}; unwrap so Settings.jsx gets flat fields directly.
export const getSettings = () => api.get('/admin/settings').then((r) => r.data.data);
export const updateSettings = (payload) => api.put('/admin/settings', payload).then((r) => r.data.data);
