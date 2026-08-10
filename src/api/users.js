import api from './client';

export const usersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', params.page);
    if (params.size) query.set('size', params.size);
    if (params.role) query.set('role', params.role);
    if (params.keyword) query.set('keyword', params.keyword);
    return api.get(`/users?${query.toString()}`);
  },
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
  delete: (id) => api.delete(`/users/${id}`),
};
