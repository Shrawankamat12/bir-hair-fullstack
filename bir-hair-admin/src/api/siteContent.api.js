import api from './axiosInstance';

// Both endpoints return {success, data}; unwrap so SiteContentEditor.jsx gets flat fields directly.
export const getSiteContent = () => api.get('/admin/site-content').then((r) => r.data.data);
export const updateSiteContent = (payload) => api.put('/admin/site-content', payload).then((r) => r.data.data);
