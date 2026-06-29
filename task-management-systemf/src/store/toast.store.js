import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      // Keep only up to 3 toasts, newer on top (we'll push to front)
      toasts: [{ id: Date.now(), ...toast }, ...state.toasts].slice(0, 3),
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
