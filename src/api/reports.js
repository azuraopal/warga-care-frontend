import api from './client';

export const reportsApi = {
  create: (data) => api.post('/reports', data),
  getById: (id) => api.get(`/reports/${id}`),
  getMyReports: (page = 0, size = 10) => api.get(`/reports/me?page=${page}&size=${size}`),
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', params.page);
    if (params.size) query.set('size', params.size);
    if (params.category) query.set('category', params.category);
    if (params.status) query.set('status', params.status);
    if (params.keyword) query.set('keyword', params.keyword);
    return api.get(`/reports?${query.toString()}`);
  },
  update: (id, data) => api.put(`/reports/${id}`, data),
  updateStatus: (id, data) => api.patch(`/reports/${id}/status`, data),
  delete: (id) => api.delete(`/reports/${id}`),
};
