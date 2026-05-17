import axiosInstance from './axiosInstance';

export const getAll  = (page = 1, pageSize = 10) => axiosInstance.get(`/api/labtest?page=${page}&pageSize=${pageSize}`);
export const getById = (id)  => axiosInstance.get(`/api/labtest/${id}`);
export const create  = (data) => axiosInstance.post('/api/labtest', data);
export const update  = (id, data) => axiosInstance.put(`/api/labtest/${id}`, data);
export const remove  = (id)  => axiosInstance.delete(`/api/labtest/${id}`);
