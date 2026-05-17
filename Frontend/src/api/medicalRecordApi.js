import axiosInstance from './axiosInstance';

export const getMedicalRecordsByDoctor = (doctorId, page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/medicalrecord/doctor/${doctorId}`, { params: { page, pageSize } });

export const getMyPatientsRecords = (page = 1, pageSize = 10) =>
  axiosInstance.get('/api/medicalrecord/doctor/my-patients-records', { params: { page, pageSize } });

export const getMedicalRecordsByPatient = (patientId, page = 1, pageSize = 10) =>
  axiosInstance.get(`/api/medicalrecord/patient/${patientId}`, { params: { page, pageSize } });

export const createMedicalRecord = (data) =>
  axiosInstance.post('/api/medicalrecord', data);
