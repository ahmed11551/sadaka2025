import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '@/lib/api';
import { toast } from 'sonner';

export function useCampaignComments(campaignId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['comments', 'campaign', campaignId, page, limit],
    queryFn: () => commentApi.getCampaignComments(campaignId, page, limit),
    enabled: !!campaignId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentApi.createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Комментарий добавлен');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при добавлении комментария');
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentApi.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Комментарий удален');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при удалении комментария');
    },
  });
}
