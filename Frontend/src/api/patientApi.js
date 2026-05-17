import axiosInstance from './axiosInstance';

export const getAll    = (page = 1, pageSize = 10, search) => axiosInstance.get(`/api/patient?page=${page}&pageSize=${pageSize}&search=${search}    `);
export const getById   = (id)  => axiosInstance.get(`/api/patient/${id}`);
export const create    = (data) => axiosInstance.post('/api/patient', data);
export const update    = (id, data) => axiosInstance.put(`/api/patient/${id}`, data);
export const remove    = (id)  => axiosInstance.delete(`/api/patient/${id}`);
