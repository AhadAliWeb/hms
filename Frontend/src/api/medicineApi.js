import axiosInstance from './axiosInstance';
 
export const getAll      = (page = 1, pageSize = 10, search = '') =>
  axiosInstance.get('/api/medicine', { params: { page, pageSize, ...(search ? { search } : {}) } });
 
export const getById     = (id)  => axiosInstance.get(`/api/medicine/${id}`);
 
export const getLowStock = (page = 1, pageSize = 10, search) =>
  axiosInstance.get('/api/medicine/low-stock', { params: { page, pageSize, ...(search ? { search } : {}) } });
 
export const create      = (data) => axiosInstance.post('/api/medicine', data);
 
export const update      = (id, data) => axiosInstance.put(`/api/medicine/${id}`, data);
 
export const remove      = (id)  => axiosInstance.delete(`/api/medicine/${id}`);
 