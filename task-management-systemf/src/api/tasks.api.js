import api from './axios';

export const getAllUserTasks = async () => {
  const { data } = await api.get('/tasks');
  return data;
};
