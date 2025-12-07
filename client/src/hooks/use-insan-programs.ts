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
        const programs = await insanApi.getPrograms();
        console.log('[useInsanPrograms] Loaded programs:', programs?.length || 0, programs);
        return programs || [];
      } catch (error: any) {
        // Log error for debugging
        console.error('[useInsanPrograms] Error loading Insan programs:', error);
        console.error('[useInsanPrograms] Error details:', {
          message: error?.message,
          status: error?.status,
          details: error?.details,
        });
        // Return empty array instead of throwing - graceful degradation
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут - программы не меняются часто
    cacheTime: 10 * 60 * 1000, // 10 минут
    retry: false,
    throwOnError: false,
    refetchOnMount: true, // Загружать при монтировании
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
        const program = await insanApi.getProgramById(id);
        if (import.meta.env.DEV) {
          console.log(`[useInsanProgram] Loaded program ${id}:`, program);
        }
        return program;
      } catch (error: any) {
        // Error is already handled in insanApi.getProgramById - it returns null
        console.error(`[useInsanProgram] Error loading program ${id}:`, error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
    retry: false,
    throwOnError: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

