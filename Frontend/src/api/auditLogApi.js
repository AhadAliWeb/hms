import axiosInstance from './axiosInstance';

export const getAll = (page = 1, pageSize = 20) => axiosInstance.get(`/api/auditlog?page=${page}&pageSize=${pageSize}`);
