import axiosInstance from './axiosInstance';

export const getAll              = (page = 1, pageSize = 10) => axiosInstance.get(`/api/bed?page=${page}&pageSize=${pageSize}`);
export const getById             = (id)  => axiosInstance.get(`/api/bed/${id}`);
export const getAvailableByWard  = (wardId, page = 1, pageSize = 10) => axiosInstance.get(`/api/bed/available/${wardId}?page=${page}&pageSize=${pageSize}`);
export const getAllByWard  = (wardId, page = 1, pageSize = 10) => axiosInstance.get(`/api/bed/all/${wardId}?page=${page}&pageSize=${pageSize}`);
export const create              = (data) => axiosInstance.post('/api/bed', data);
export const update              = (id, data) => axiosInstance.put(`/api/bed/${id}`, data);
export const remove              = (id)  => axiosInstance.delete(`/api/bed/${id}`);
