import { PartnerRepository } from '../repositories/partner.repository';
import { PaginationParams } from '../types';
import { Prisma } from '@prisma/client';

export class PartnerService {
  private partnerRepository: PartnerRepository;

  constructor() {
    this.partnerRepository = new PartnerRepository();
  }

  async getPartners(filters: {
    country?: string;
    city?: string;
    type?: string;
    verified?: boolean;
  } = {}, pagination: PaginationParams = {}) {
    return this.partnerRepository.findMany(filters, pagination);
  }

  async getPartner(id: string) {
    return this.partnerRepository.findById(id);
  }

  async getPartnerBySlug(slug: string) {
    return this.partnerRepository.findBySlug(slug);
  }

  async createPartner(data: {
    name: string;
    nameAr?: string;
    slug: string;
    type: string;
    description: string;
    logo?: string;
    country: string;
    city?: string;
    location: string;
    website?: string;
    email?: string;
    phone?: string;
    categories?: string[];
  }) {
    const partnerData: Prisma.PartnerCreateInput = {
      ...data,
      categories: data.categories || [],
    };

    return this.partnerRepository.create(partnerData);
  }

  async updatePartner(id: string, data: Partial<{
    name: string;
    nameAr: string;
    description: string;
    logo: string;
    website: string;
    email: string;
    phone: string;
  }>) {
    return this.partnerRepository.update(id, data);
  }

  async getPartnerCampaigns(partnerId: string, pagination: PaginationParams = {}) {
    return this.partnerRepository.getActiveCampaigns(partnerId, pagination);
  }
}
