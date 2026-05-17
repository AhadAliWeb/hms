import axiosInstance from './axiosInstance';

export const getLabOrdersByDoctor = (doctorId, page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/laborder/doctor/${doctorId}`, { params: { page, pageSize } });

export const getMyLabOrders = (page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/laborder/doctor/my-lab-orders`, { params: { page, pageSize } });

export const getLabOrdersByPatient = (patientId, page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/laborder/patient/${patientId}`, { params: { page, pageSize } });

export const createLabOrder = (data) =>
  axiosInstance.post('/api/laborder', data);

export const updateLabOrderStatus = (id, status) =>
  axiosInstance.put(`/api/laborder/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' },
  });
