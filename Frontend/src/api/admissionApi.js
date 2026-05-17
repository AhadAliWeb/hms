import axiosInstance from './axiosInstance';

export const getAll     = (page = 1, pageSize = 10) =>
  axiosInstance.get('/api/admission', { params: { page, pageSize } });

export const search     = (query, page = 1, pageSize = 10) =>
  axiosInstance.get('/api/admission/search', { params: { query, page, pageSize } });

export const getByPatient = (patientId, page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/admission/patient/${patientId}`, { params: { page, pageSize } });

export const getByWard  = (wardId, page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/admission/ward/${wardId}`, { params: { page, pageSize } });

export const create     = (data) =>
  axiosInstance.post('/api/admission', data);

export const discharge  = (id) =>
  axiosInstance.put(`/api/admission/${id}/discharge`);
