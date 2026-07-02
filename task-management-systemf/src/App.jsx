import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

import GlobalToast from './components/ui/GlobalToast';
import KeyboardShortcuts from './components/layout/KeyboardShortcuts';

import { useAuthStore } from './store/auth.store';

function App() {
  useEffect(() => {
    const handleStorage = (e) => {
      // Zustand persist writes to 'auth-storage'
      if (e.key === 'auth-storage' && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          // If the token was removed in another tab, clear it here too
          if (!newState.state || !newState.state.token) {
            useAuthStore.getState().logout();
          }
        } catch (error) {
          console.error("Error parsing auth storage:", error);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <GlobalToast />
      <KeyboardShortcuts />
    </QueryClientProvider>
  );
}

export default App;
