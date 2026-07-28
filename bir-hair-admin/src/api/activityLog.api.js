import api from './axiosInstance';
export const getActivityLogs = (params) => api.get('/admin/activity-logs', { params }).then((r) => r.data.data);
