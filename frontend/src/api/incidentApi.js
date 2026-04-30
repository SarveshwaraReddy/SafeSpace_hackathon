import api from './axios';

export const incidentApi = {
  getAll: () => api.get('/incidents'),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.put(`/incidents/${id}`, data),
};
