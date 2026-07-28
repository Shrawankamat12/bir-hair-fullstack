import api from './axiosInstance';

// Unwraps the {success, data} envelope so Dashboard.jsx gets flat summary fields directly.
export const getDashboardSummary = () => api.get('/admin/dashboard').then((r) => r.data.data);
