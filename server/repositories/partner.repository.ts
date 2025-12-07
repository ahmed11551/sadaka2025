import prisma from '../db/client';
import { Partner, Prisma } from '@prisma/client';
import { PaginationParams } from '../types';
import { NotFoundError } from '../utils/errors';

export class PartnerRepository {
  async findById(id: string) {
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        _count: {
          select: { campaigns: true, donations: true },
        },
      },
    });

    if (!partner) {
      throw new NotFoundError('Partner');
    }

    return partner;
  }

  async findBySlug(slug: string) {
    const partner = await prisma.partner.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { campaigns: true, donations: true },
        },
      },
    });

    if (!partner) {
      throw new NotFoundError('Partner');
    }

    return partner;
  }

  async findMany(filters: {
    country?: string;
    city?: string;
    type?: string;
    verified?: boolean;
  } = {}, pagination: PaginationParams = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.PartnerWhereInput = {};
    if (filters.country) where.country = filters.country;
    if (filters.city) where.city = filters.city;
    if (filters.type) where.type = filters.type;
    if (filters.verified !== undefined) where.verified = filters.verified;

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        include: {
          _count: {
            select: { campaigns: true, donations: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.partner.count({ where }),
    ]);

    return { partners, total, page, limit };
  }

  async create(data: Prisma.PartnerCreateInput): Promise<Partner> {
    return prisma.partner.create({
      data,
    });
  }

  async update(id: string, data: Prisma.PartnerUpdateInput): Promise<Partner> {
    return prisma.partner.update({
      where: { id },
      data,
    });
  }

  async updateStats(partnerId: string) {
    const stats = await prisma.donation.aggregate({
      where: { partnerId, paymentStatus: 'completed' },
      _sum: { amount: true },
      _count: { userId: true },
    });

    await this.update(partnerId, {
      totalCollected: stats._sum.amount || 0,
      totalDonors: stats._count.userId,
    });
  }

  async getActiveCampaigns(partnerId: string, pagination: PaginationParams = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where: { partnerId, status: 'active' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where: { partnerId, status: 'active' } }),
    ]);

    return { campaigns, total, page, limit };
  }
}
