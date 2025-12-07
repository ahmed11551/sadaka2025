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
        handleApiError(error, 'Ошибка при загрузке программ фонда Инсан');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут - программы не меняются часто
    cacheTime: 10 * 60 * 1000, // 10 минут
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Hook для получения программы фонда Инсан по ID
 */
export function useInsanProgram(id: number | null) {
  return useQuery<InsanProgram, Error>({
    queryKey: ['insan', 'program', id],
    queryFn: async () => {
      if (!id) throw new Error('Program ID is required');
      try {
        return await insanApi.getProgramById(id);
      } catch (error: any) {
        handleApiError(error, `Ошибка при загрузке программы ${id}`);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
}

