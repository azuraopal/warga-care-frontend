import api from './client';

export const announcementsApi = {
  getAll: (page = 0, size = 10) => api.get(`/announcements?page=${page}&size=${size}`),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};
