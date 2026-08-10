import api from './client';

export const chatApi = {
  sendMessage: (message) => api.post('/chat', { message }),
};
