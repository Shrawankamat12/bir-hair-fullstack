import api from './axiosInstance';

// All endpoints return {success, data}; unwrap to the plain hero-slider config.
const unwrap = (r) => r.data.data;

export const getHeroSlider = () => api.get('/admin/hero-slider').then(unwrap);
export const saveHeroSlider = (payload) => api.put('/admin/hero-slider', payload).then(unwrap);
// Writes the default 5-slide setup; the server refuses (409) if one already exists.
export const initHeroSlider = () => api.post('/admin/hero-slider/initialize').then(unwrap);