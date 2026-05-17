import axiosInstance from './axiosInstance';

export const getPrescriptionsByDoctor = (doctorId, page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/prescription/doctor/${doctorId}`, { params: { page, pageSize } });

export const getMinePrescriptions = (page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/prescription/my-prescriptions`, { params: { page, pageSize } });

export const getPrescriptionsByPatient = (patientId, page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/prescription/patient/${patientId}`, { params: { page, pageSize } });


export const getAllPrescriptions = (page = 1, pageSize = 10, search, status) =>
  axiosInstance.get('/api/prescription', { params: { page, pageSize, search, status } });

export const createPrescription = (data) =>
  axiosInstance.post('/api/prescription', data);

export const dispensePrescription = (id) =>
  axiosInstance.put(`/api/prescription/${id}/dispense`);
