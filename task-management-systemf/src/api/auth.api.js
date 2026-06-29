import api from './axios';

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data; // { token, username, role, avatar }
};

export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};
