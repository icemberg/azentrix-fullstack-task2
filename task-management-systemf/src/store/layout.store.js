import { create } from 'zustand';

export const useLayoutStore = create((set) => ({
  isCollapsed: window.innerWidth < 1024,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setSidebarCollapsed: (isCollapsed) => set({ isCollapsed }),
}));
