import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationApi } from '@/lib/api';
import { handleApiError } from '@/lib/error-handler';

export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: donationApi.createDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['donationStats'] });
      toast.success('Donation successful! Thank you for your generosity.');
    },
    onError: (error: any) => {
      handleApiError(error, 'Ошибка при создании пожертвования');
    },
  });
}

export function useUserDonations(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['donations', 'user', page, limit],
    queryFn: () => donationApi.getUserDonations(page, limit),
  });
}

export function useCampaignDonations(campaignId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['donations', 'campaign', campaignId, page, limit],
    queryFn: () => donationApi.getCampaignDonations(campaignId, page, limit),
    enabled: !!campaignId,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ['donationStats'],
    queryFn: () => donationApi.getUserStats(),
  });
}
