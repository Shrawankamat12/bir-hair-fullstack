import api from './axiosInstance';

export const adminLogin = (payload) => api.post('/auth/admin-login', payload).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
export const logout = () => api.post('/auth/logout').then((r) => r.data);
