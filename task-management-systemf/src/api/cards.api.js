import api from './axios';

export const createCard = async (cardData) => {
  const { data } = await api.post(`/boards/${cardData.boardId}/cards`, cardData);
  return data;
};

export const updateCard = async ({ id, boardId, cardData }) => {
  const { data } = await api.put(`/boards/${boardId}/cards/${id}`, cardData);
  return data;
};

export const deleteCard = async ({ id, boardId }) => {
  await api.delete(`/boards/${boardId}/cards/${id}`);
};

export const moveCard = async ({ boardId, cardId, shift }) => {
  const { data } = await api.put(`/boards/${boardId}/cards/${cardId}/move`, { shift, boardId, cardId });
  return data;
};
