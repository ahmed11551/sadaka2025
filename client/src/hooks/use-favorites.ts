import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoriteApi } from '@/lib/api';
import { handleApiError } from '@/lib/error-handler';
import { toast } from 'sonner';
// No authentication needed - all requests use test_token_123

export function useFavorites() {
  const queryClient = useQueryClient();
  // Always enabled - no authentication needed
  const isAuthenticated = true;

  const { data: favoritesData } = useQuery({
    queryKey: ['userFavorites'],
    queryFn: () => favoriteApi.getUserFavorites(),
    enabled: true, // Always enabled - no authentication needed
  });

  const toggleMutation = useMutation({
    mutationFn: favoriteApi.toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error: any) => {
      handleApiError(error, 'Ошибка при обновлении избранного');
    },
  });

  // Extract campaign IDs from favorites data
  const favorites = useMemo(() => {
    if (!favoritesData?.data) return [];
    const data = (favoritesData as any).data;
    // Handle different response formats
    if (Array.isArray(data)) {
      return data.map((fav: any) => fav.campaignId || fav.campaign?.id || fav.id);
    }
    if (data.items) {
      return data.items.map((fav: any) => fav.campaignId || fav.campaign?.id || fav.id);
    }
    if (data.campaignIds) {
      return data.campaignIds;
    }
    return [];
  }, [favoritesData]) as string[];

  const toggleFavorite = (campaignId: string, redirectToLogin?: () => void) => {
    // No authentication check needed - all requests use test_token_123
    toggleMutation.mutate(campaignId);
  };

  const isFavorite = (campaignId: string) => favorites.includes(campaignId);

  return { favorites, toggleFavorite, isFavorite, isLoading: toggleMutation.isPending };
}
