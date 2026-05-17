import axiosInstance from './axiosInstance';

export const getAppointmentsByDoctor = (doctorId, page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/appointment/doctor/${doctorId}`, { params: { page, pageSize } });

export const getAllAppointments = (page = 1, pageSize = 10, search='', status='') =>
  axiosInstance.get('/api/appointment', { params: { page, pageSize, search, status } });

export const getMyAppointments = (page = 1, pageSize = 10) =>
  axiosInstance.get('/api/appointment/my-appointments', { params: { page, pageSize } });

export const getAppointmentsByPatient = (patientId, page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/appointment/patient/${patientId}`, { params: { page, pageSize } });

export const createAppointment = (data) =>
  axiosInstance.post('/api/appointment', data);

export const updateAppointmentStatus = (id, status) =>
  axiosInstance.put(`/api/appointment/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' },
  });

export const removeAppointment = (id) =>
  axiosInstance.delete(`/api/appointment/${id}`);
