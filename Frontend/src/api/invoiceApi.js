import axiosInstance from './axiosInstance';

export const getAll = (page = 1, pageSize = 10, search = '', status = '') => {
  const params = { page, pageSize };
  if (search) params.search = search;
  if (status) params.status = status;
  return axiosInstance.get('/api/invoice', { params });
};

export const getById = (id) =>
  axiosInstance.get(`/api/invoice/${id}`);

export const create = (data) =>
  axiosInstance.post('/api/invoice', data);

export const markAsPaid = (id) =>
  axiosInstance.post(`/api/invoice/${id}/pay`);

export const downloadPdf = async (id) => {
  const response = await axiosInstance.get(`/api/invoice/${id}/pdf`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Invoice_${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
