import api from './axios';

export const getActiveSessions = async () => {
  const { data } = await api.get('/sessions');
  return data;
};

export const revokeSession = async (sessionId) => {
  const { data } = await api.delete(`/sessions/${sessionId}`);
  return data;
};

export const revokeAllOtherSessions = async () => {
  const { data } = await api.delete('/sessions/other');
  return data;
};
