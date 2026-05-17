import axiosInstance from './axiosInstance';

export const getAll    = (page = 1, pageSize = 10) => axiosInstance.get(`/api/ward?page=${page}&pageSize=${pageSize}`);
export const getById   = (id)  => axiosInstance.get(`/api/ward/${id}`);
export const create    = (data) => axiosInstance.post('/api/ward', data);
export const update    = (id, data) => axiosInstance.put(`/api/ward/${id}`, data);
export const remove    = (id)  => axiosInstance.delete(`/api/ward/${id}`);
