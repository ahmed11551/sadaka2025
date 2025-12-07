import { useQuery } from '@tanstack/react-query';
import { partnerApi } from '@/lib/api';

export function usePartners(params?: {
  country?: string;
  city?: string;
  type?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['partners', params],
    queryFn: () => partnerApi.getPartners(params),
    retry: false,
    throwOnError: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: ['partner', id],
    queryFn: () => partnerApi.getPartner(id),
    enabled: !!id,
    retry: false,
    throwOnError: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function usePartnerBySlug(slug: string) {
  return useQuery({
    queryKey: ['partner', 'slug', slug],
    queryFn: () => partnerApi.getPartnerBySlug(slug),
    enabled: !!slug,
    retry: false,
    throwOnError: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function usePartnerCampaigns(partnerId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['partner', partnerId, 'campaigns', page, limit],
    queryFn: () => partnerApi.getPartnerCampaigns(partnerId, page, limit),
    enabled: !!partnerId,
    retry: false,
    throwOnError: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
