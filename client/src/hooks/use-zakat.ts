import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zakatApi } from '@/lib/api';
import { handleApiError } from '@/lib/error-handler';
import { toast } from 'sonner';

export function useZakatHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['zakat', 'history', page, limit],
    queryFn: () => zakatApi.getHistory(page, limit),
    throwOnError: false,
  });
}

export function useCalculateZakat() {
  return useMutation({
    mutationFn: (data: {
      assets: {
        cash_total?: number;
        gold_g?: number;
        silver_g?: number;
        business_goods_value?: number;
        investments?: number;
        receivables_collectible?: number;
      };
      debts_short_term?: number;
      nisab_currency?: string;
      nisab_value?: number;
      rate_percent?: number;
    }) => zakatApi.calculate(data),
    onError: (error) => {
      handleApiError(error);
    },
  });
}

export function usePayZakat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      amount: number;
      currency?: string;
      fundId?: string;
      campaignId?: string;
    }) => zakatApi.pay(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zakat'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      toast.success('Закят успешно выплачен!');
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}

