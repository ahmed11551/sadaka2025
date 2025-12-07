import { useQuery } from '@tanstack/react-query';
import { fundsApi } from '@/lib/api';

export function useFunds(params?: {
  country?: string;
  purpose?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['funds', params],
    queryFn: () => fundsApi.getFunds(params),
    throwOnError: false,
  });
}

export function useFund(id: string) {
  return useQuery({
    queryKey: ['funds', id],
    queryFn: () => fundsApi.getFund(id),
    enabled: !!id,
    throwOnError: false,
  });
}

