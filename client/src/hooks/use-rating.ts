import { useQuery } from '@tanstack/react-query';
import { ratingApi, RatingDonor, RatingStats, TopCampaign } from '@/lib/rating-api';

/**
 * Hook для получения топ доноров
 */
export function useTopDonors(country?: string) {
  return useQuery<RatingDonor[]>({
    queryKey: ['rating', 'donors', country],
    queryFn: () => ratingApi.getTopDonors(country),
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
  });
}

/**
 * Hook для получения статистики платформы
 */
export function useRatingStats() {
  return useQuery<RatingStats>({
    queryKey: ['rating', 'stats'],
    queryFn: () => ratingApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
  });
}

/**
 * Hook для получения топ сборов
 */
export function useTopCampaigns(country?: string) {
  return useQuery<TopCampaign[]>({
    queryKey: ['rating', 'top-campaigns', country],
    queryFn: () => ratingApi.getTopCampaigns(country),
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
  });
}

/**
 * Hook для получения завершенных сборов
 */
export function useCompletedCampaigns(country?: string) {
  return useQuery<TopCampaign[]>({
    queryKey: ['rating', 'completed-campaigns', country],
    queryFn: () => ratingApi.getCompletedCampaigns(country),
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
  });
}
