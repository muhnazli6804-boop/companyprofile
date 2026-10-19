import { QueryClient } from '@tanstack/react-query';

// TODO: see ARCHITECTURE.md section 6 & Struktur-Folder-Padindi.md section 3
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
