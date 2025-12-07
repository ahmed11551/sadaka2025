import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { handleApiError } from '@/lib/error-handler';
import { toast } from 'sonner';

export function useCampaigns(params?: {
  type?: string;
  status?: string;
  category?: string;
  urgent?: boolean;
  partnerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => campaignApi.getCampaigns(params),
    retry: false, // Don't retry on error
    throwOnError: false, // Don't throw errors, return them in error state
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignApi.getCampaign(id),
    enabled: !!id,
    retry: false,
    throwOnError: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useCampaignBySlug(slug: string) {
  return useQuery({
    queryKey: ['campaign', 'slug', slug],
    queryFn: () => campaignApi.getCampaignBySlug(slug),
    enabled: !!slug,
    retry: false,
    throwOnError: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campaignApi.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Кампания успешно создана');
    },
    onError: (error: any) => {
      handleApiError(error, 'Ошибка при создании кампании');
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: Partial<{
        title: string;
        description: string;
        fullDescription: string;
        image: string;
      }>;
    }) => campaignApi.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Кампания обновлена');
    },
    onError: (error: any) => {
      handleApiError(error, 'Ошибка при обновлении кампании');
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campaignApi.deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Кампания удалена');
    },
    onError: (error: any) => {
      handleApiError(error, 'Ошибка при удалении кампании');
    },
  });
}

export function useFavoriteCampaigns(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['campaigns', 'favorites', page, limit],
    queryFn: () => campaignApi.getUserFavorites(page, limit),
    retry: false,
    throwOnError: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
