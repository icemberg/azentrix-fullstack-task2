import api from './axios';

export const getBoards = async (teamId) => {
  if (!teamId) return [];
  const { data } = await api.get(`/teams/${teamId}/boards`);
  return data;
};

export const getBoardById = async (id) => {
  const { data } = await api.get(`/boards/${id}`);
  return data;
};

export const createBoard = async ({ teamId, boardData }) => {
  const { data } = await api.post(`/teams/${teamId}/boards`, boardData);
  return data;
};

export const updateBoard = async ({ id, boardData }) => {
  const { data } = await api.put(`/boards/${id}`, boardData);
  return data;
};

export const deleteBoard = async (id) => {
  await api.delete(`/boards/${id}`);
};
