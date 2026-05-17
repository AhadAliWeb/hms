import axiosInstance from './axiosInstance';

// Existing from Part 1 — do not remove
export const getAdminDashboard = () =>
  axiosInstance.get('/dashboard/admin');

// Added in Part 2
export const getDoctorDashboard = () =>
  axiosInstance.get('/api/dashboard/doctor');

// Added in Part 4
export const getNurseDashboard = () =>
  axiosInstance.get('/api/dashboard/nurse');

// Added in Part 7
export const getAccountantDashboard = () =>
  axiosInstance.get('/api/dashboard/accountant');
