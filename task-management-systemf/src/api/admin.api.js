import api from './axios';

export const getAllUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data;
};

export const updateUserRole = async ({ id, role }) => {
  const { data } = await api.put(`/admin/users/${id}/role?role=${role}`);
  return data;
};
