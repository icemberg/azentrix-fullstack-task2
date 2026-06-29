import React from 'react';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <GlobalToast />
      <KeyboardShortcuts />
    </QueryClientProvider>
  );
}

export default App;
