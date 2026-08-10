import api from './client';

export const categoriesApi = {
  getAll: (type) => api.get(type ? `/categories?type=${type}` : '/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};
