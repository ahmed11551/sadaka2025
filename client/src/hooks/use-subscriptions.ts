import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/lib/api';
import { handleApiError } from '@/lib/error-handler';
import { toast } from 'sonner';

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions', 'me'],
    queryFn: () => subscriptionApi.getMySubscriptions(),
    throwOnError: false,
  });
}

export function useCheckoutSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { tier: string }) => subscriptionApi.checkout(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Подписка оформлена успешно!');
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'pause' | 'resume' | 'cancel' }) =>
      subscriptionApi.updateSubscription(id, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Подписка обновлена');
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}

