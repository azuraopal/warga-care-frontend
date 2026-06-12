import api from './client';

export const eventsApi = {
  getAll: (page = 0, size = 10) => api.get(`/events?page=${page}&size=${size}`),
  getUpcoming: (page = 0, size = 10) => api.get(`/events/upcoming?page=${page}&size=${size}`),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};
