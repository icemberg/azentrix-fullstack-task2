import api from './axios';

export const getCurrentUser = async () => {
  const { data } = await api.get('/users/me');
  return data;
};

export const updateCurrentUser = async (userData) => {
  const { data } = await api.put('/users/me', userData);
  return data;
};

export const getAllUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

export const getMyTasks = async () => {
  const { data } = await api.get('/users/me/tasks');
  return data;
};
