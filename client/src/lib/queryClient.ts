import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: false,
      throwOnError: false,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        if (error instanceof ApiError) {
          if (error.status >= 400 && error.status < 500) {
            return false;
          }
          // Retry on server errors
          if (error.status >= 500) {
            return failureCount < 1;
          }
        }
        return false;
      },
    },
  },
});

// Global error handler for React Query
if (typeof window !== 'undefined') {
  // Listen for 401 errors
  window.addEventListener('auth:unauthorized', () => {
    // Clear query cache
    queryClient.clear();
    // Redirect to login if not already there
    // Note: This is called globally, so we use window.location for redirect
    // Navigation hooks can't be used here as this is outside React component tree
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
      }
    }
  });
}
