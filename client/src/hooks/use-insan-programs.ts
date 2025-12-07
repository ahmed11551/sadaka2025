import { useQuery } from '@tanstack/react-query';
import { insanApi, InsanProgram } from '@/lib/insan-api';
import { handleApiError } from '@/lib/error-handler';

/**
 * Hook для получения списка всех программ фонда Инсан
 */
export function useInsanPrograms() {
  return useQuery<InsanProgram[], Error>({
    queryKey: ['insan', 'programs'],
    queryFn: async () => {
      try {
        return await insanApi.getPrograms();
      } catch (error: any) {
        // Silently handle errors - return empty array instead of throwing
        console.error('Error loading Insan programs:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут - программы не меняются часто
    cacheTime: 10 * 60 * 1000, // 10 минут
    retry: false,
    throwOnError: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook для получения программы фонда Инсан по ID
 */
export function useInsanProgram(id: number | null) {
  return useQuery<InsanProgram | null, Error>({
    queryKey: ['insan', 'program', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        return await insanApi.getProgramById(id);
      } catch (error: any) {
        // Silently handle errors - return null instead of throwing
        console.error(`Error loading Insan program ${id}:`, error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

