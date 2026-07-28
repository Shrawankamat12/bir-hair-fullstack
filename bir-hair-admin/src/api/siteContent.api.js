import api from './axiosInstance';

export const getSiteContent = () => api.get('/admin/site-content').then((r) => r.data.data);
export const updateSiteContent = (payload) => api.put('/admin/site-content', payload).then((r) => r.data.data);
