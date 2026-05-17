import axiosInstance from './axiosInstance';

export const getAll    = (page = 1, pageSize = 10) => axiosInstance.get(`/api/doctor?page=${page}&pageSize=${pageSize}`);
export const getById   = (id)  => axiosInstance.get(`/api/doctor/${id}`);
export const create    = (data) => axiosInstance.post('/api/doctor', data);
export const update    = (id, data) => axiosInstance.put(`/api/doctor/${id}`, data);
export const remove    = (id)  => axiosInstance.delete(`/api/doctor/${id}`);
