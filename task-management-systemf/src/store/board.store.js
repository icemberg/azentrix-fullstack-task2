import { create } from 'zustand';

export const useBoardStore = create((set) => ({
  boards: [],
  currentBoard: null,
  setBoards: (boards) => set({ boards }),
  setCurrentBoard: (board) => set({ currentBoard: board }),
  addBoard: (board) => set((state) => ({ boards: [...state.boards, board] })),
  updateBoard: (updatedBoard) => set((state) => ({
    boards: state.boards.map(b => b.boardId === updatedBoard.boardId ? updatedBoard : b),
    currentBoard: state.currentBoard?.boardId === updatedBoard.boardId ? updatedBoard : state.currentBoard
  })),
  removeBoard: (boardId) => set((state) => ({
    boards: state.boards.filter(b => b.boardId !== boardId),
    currentBoard: state.currentBoard?.boardId === boardId ? null : state.currentBoard
  })),
}));
