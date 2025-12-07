import prisma from '../db/client';
import { Campaign, Prisma } from '@prisma/client';
import { CampaignFilters, PaginationParams } from '../types';
import { NotFoundError } from '../utils/errors';

export class CampaignRepository {
  async findById(id: string, includeRelations = false) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: includeRelations ? {
        partner: true,
        author: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
        _count: {
          select: { donations: true, favorites: true, comments: true },
        },
      } : undefined,
    });

    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    return campaign;
  }

  async findBySlug(slug: string, includeRelations = false) {
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      include: includeRelations ? {
        partner: true,
        author: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
        _count: {
          select: { donations: true, favorites: true, comments: true },
        },
      } : undefined,
    });

    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    return campaign;
  }

  async findMany(filters: CampaignFilters = {}, pagination: PaginationParams = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {};

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.urgent !== undefined) where.urgent = filters.urgent;
    if (filters.partnerId) where.partnerId = filters.partnerId;
    if (filters.authorId) where.authorId = filters.authorId;

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          partner: {
            select: { id: true, name: true, logo: true, verified: true },
          },
          author: {
            select: { id: true, username: true, fullName: true, avatar: true },
          },
          _count: {
            select: { donations: true, favorites: true },
          },
        },
        orderBy: [
          { urgent: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return { campaigns, total, page, limit };
  }

  async create(data: Prisma.CampaignCreateInput): Promise<Campaign> {
    return prisma.campaign.create({
      data,
      include: {
        partner: true,
        author: {
          select: { id: true, username: true, fullName: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.CampaignUpdateInput): Promise<Campaign> {
    return prisma.campaign.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.campaign.delete({
      where: { id },
    });
  }

  async addDonation(campaignId: string, amount: number): Promise<Campaign> {
    return prisma.campaign.update({
      where: { id: campaignId },
      data: {
        collected: { increment: amount },
        participantCount: { increment: 1 },
      },
    });
  }

  async checkCompletion(campaignId: string): Promise<void> {
    const campaign = await this.findById(campaignId);
    
    if (campaign.collected >= campaign.goal && campaign.status === 'active') {
      await this.update(campaignId, {
        status: 'completed',
        completedAt: new Date(),
      });
    }
  }

  async getUserFavorites(userId: string, pagination: PaginationParams = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where: {
          favorites: {
            some: { userId },
          },
        },
        include: {
          partner: {
            select: { id: true, name: true, logo: true },
          },
          author: {
            select: { id: true, username: true, fullName: true },
          },
          _count: {
            select: { donations: true, favorites: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.campaign.count({
        where: {
          favorites: {
            some: { userId },
          },
        },
      }),
    ]);

    return { campaigns, total, page, limit };
  }
}
