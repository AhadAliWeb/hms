import axiosInstance from './axiosInstance';

export const login = (data) => axiosInstance.post('/api/auth/login', data);
