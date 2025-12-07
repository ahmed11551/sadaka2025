import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';

export function useReportSummary(period?: string) {
  return useQuery({
    queryKey: ['reports', 'summary', period],
    queryFn: () => reportsApi.getSummary({ period }),
    throwOnError: false,
  });
}

export function useMyHistory(params?: {
  type?: 'donation' | 'subscription' | 'zakat' | 'campaign';
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['reports', 'history', params],
    queryFn: () => reportsApi.getMyHistory(params),
    throwOnError: false,
  });
}

export function useFundReports(params?: {
  fund_id?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['reports', 'funds', params],
    queryFn: () => reportsApi.getFundReports(params),
    throwOnError: false,
  });
}

