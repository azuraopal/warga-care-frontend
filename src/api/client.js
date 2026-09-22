import axios from 'axios';

export const getApiBaseUrl = () => {
  const rawUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api').trim();
  const trimmed = rawUrl.replace(/\/+$/, '');

  // If an absolute origin without path is provided (e.g., http://localhost:8080), append /api
  if (/^https?:\/\/[^/]+$/i.test(trimmed)) {
    return `${trimmed}/api`;
  }
  return trimmed || '/api';
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
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
