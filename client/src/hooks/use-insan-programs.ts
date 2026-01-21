import { useQuery } from '@tanstack/react-query';
import { insanApi, InsanProgram, InsanFundraising } from '@/lib/insan-api';

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

/**
 * Hook для получения списка активных сборов фонда Инсан
 */
export function useInsanActiveFundraisings() {
  return useQuery<InsanFundraising[], Error>({
    queryKey: ['insan', 'active-fundraisings'],
    queryFn: async () => {
      try {
        const fundraisings = await insanApi.getActiveFundraisings();
        if (import.meta.env.DEV) {
          console.log('[useInsanActiveFundraisings] Loaded fundraisings:', fundraisings?.length || 0);
          if (fundraisings && fundraisings.length > 0) {
            console.log('[useInsanActiveFundraisings] First fundraising sample:', fundraisings[0]);
          }
        }
        return fundraisings || [];
      } catch (error: any) {
        // Log error for debugging
        console.error('[useInsanActiveFundraisings] Error loading Insan active fundraisings:', error);
        console.error('[useInsanActiveFundraisings] Error details:', {
          message: error?.message,
          status: error?.status,
          name: error?.name,
          details: error?.details,
          stack: error?.stack,
        });
        // Return empty array instead of throwing - graceful degradation
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 минуты - активные сборы могут обновляться чаще
    cacheTime: 5 * 60 * 1000, // 5 минут
    retry: false,
    throwOnError: false,
    refetchOnMount: true, // Загружать при монтировании
    refetchOnWindowFocus: true, // Обновлять при фокусе окна
    refetchInterval: 5 * 60 * 1000, // Обновлять каждые 5 минут
  });
}

/**
 * Hook для получения списка завершенных сборов фонда Инсан
 */
export function useInsanCompletedFundraisings() {
  return useQuery<InsanFundraising[], Error>({
    queryKey: ['insan', 'completed-fundraisings'],
    queryFn: async () => {
      try {
        const fundraisings = await insanApi.getCompletedFundraisings();
        if (import.meta.env.DEV) {
          console.log('[useInsanCompletedFundraisings] Loaded fundraisings:', fundraisings?.length || 0);
          if (fundraisings && fundraisings.length > 0) {
            console.log('[useInsanCompletedFundraisings] First fundraising sample:', fundraisings[0]);
          }
        }
        return fundraisings || [];
      } catch (error: any) {
        // Log error for debugging
        console.error('[useInsanCompletedFundraisings] Error loading Insan completed fundraisings:', error);
        console.error('[useInsanCompletedFundraisings] Error details:', {
          message: error?.message,
          status: error?.status,
          name: error?.name,
          details: error?.details,
          stack: error?.stack,
        });
        // Return empty array instead of throwing - graceful degradation
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут - завершенные сборы обновляются реже
    cacheTime: 10 * 60 * 1000, // 10 минут
    retry: false,
    throwOnError: false,
    refetchOnMount: true, // Загружать при монтировании
    refetchOnWindowFocus: false, // Не обновлять при фокусе (завершенные не меняются часто)
    refetchInterval: 10 * 60 * 1000, // Обновлять каждые 10 минут
  });
}

