import { create } from 'zustand';

export const useWebSocketStore = create((set) => ({
  status: 'offline', // 'online', 'offline', 'reconnecting'
  setStatus: (status) => set({ status }),
}));
