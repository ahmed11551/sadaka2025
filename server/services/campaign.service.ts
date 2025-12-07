import { CampaignRepository } from '../repositories/campaign.repository';
import { CampaignFilters, PaginationParams } from '../types';
import { ForbiddenError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export class CampaignService {
  private campaignRepository: CampaignRepository;

  constructor() {
    this.campaignRepository = new CampaignRepository();
  }

  async getCampaigns(filters: CampaignFilters = {}, pagination: PaginationParams = {}) {
    return this.campaignRepository.findMany(filters, pagination);
  }

  async getCampaign(id: string) {
    return this.campaignRepository.findById(id, true);
  }

  async getCampaignBySlug(slug: string) {
    return this.campaignRepository.findBySlug(slug, true);
  }

  async createCampaign(userId: string, data: {
    title: string;
    description: string;
    fullDescription?: string;
    category: string;
    goal: number;
    currency?: string;
    type: string;
    partnerId?: string;
    deadline?: string;
    urgent?: boolean;
    image?: string;
  }) {
    const slug = this.generateSlug(data.title);

    const campaignData: Prisma.CampaignCreateInput = {
      ...data,
      slug,
      goal: new Prisma.Decimal(data.goal),
      moderationStatus: 'pending', // New campaigns require moderation
      author: { connect: { id: userId } },
      ...(data.partnerId && { partner: { connect: { id: data.partnerId } } }),
      ...(data.deadline && { deadline: new Date(data.deadline) }),
    };

    const campaign = await this.campaignRepository.create(campaignData);
    return campaign;
  }

  async updateCampaign(campaignId: string, userId: string, data: Partial<{
    title: string;
    description: string;
    fullDescription: string;
    image: string;
  }>) {
    const campaign = await this.campaignRepository.findById(campaignId);

    if (campaign.authorId !== userId) {
      throw new ForbiddenError('You can only update your own campaigns');
    }

    return this.campaignRepository.update(campaignId, data);
  }

  async deleteCampaign(campaignId: string, userId: string) {
    const campaign = await this.campaignRepository.findById(campaignId);

    if (campaign.authorId !== userId) {
      throw new ForbiddenError('You can only delete your own campaigns');
    }

    await this.campaignRepository.delete(campaignId);
    return { message: 'Campaign deleted successfully' };
  }

  async getUserFavorites(userId: string, pagination: PaginationParams = {}) {
    return this.campaignRepository.getUserFavorites(userId, pagination);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50) + '-' + Date.now();
  }
}
