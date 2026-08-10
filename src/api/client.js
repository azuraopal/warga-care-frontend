import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthPage) {
        localStorage.removeItem('wc_token');
        localStorage.removeItem('wc_user');
        window.location.href = '/login';
      }
    }
    const apiError = error.response?.data;
    const message = apiError?.message || error.message || 'Terjadi kesalahan pada koneksi server';
    return Promise.reject(typeof apiError === 'object' && apiError !== null ? { ...apiError, message } : { message });
  }
);

export default api;
