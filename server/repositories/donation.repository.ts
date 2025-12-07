import prisma from '../db/client';
import { Donation, Prisma } from '@prisma/client';
import { PaginationParams } from '../types';

export class DonationRepository {
  async findById(id: string) {
    return prisma.donation.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, fullName: true },
        },
        campaign: {
          select: { id: true, title: true },
        },
        partner: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findByUser(userId: string, pagination: PaginationParams = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where: { userId },
        include: {
          campaign: {
            select: { id: true, title: true, image: true },
          },
          partner: {
            select: { id: true, name: true, logo: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.donation.count({ where: { userId } }),
    ]);

    return { donations, total, page, limit };
  }

  async create(data: Prisma.DonationCreateInput): Promise<Donation> {
    return prisma.donation.create({
      data,
      include: {
        campaign: true,
        partner: true,
      },
    });
  }

  async updateStatus(id: string, status: string, transactionId?: string): Promise<Donation> {
    return prisma.donation.update({
      where: { id },
      data: {
        paymentStatus: status,
        ...(transactionId && { transactionId }),
      },
    });
  }

  async getUserStats(userId: string) {
    const stats = await prisma.donation.aggregate({
      where: { userId, paymentStatus: 'completed' },
      _sum: { amount: true },
      _count: true,
    });

    return {
      totalDonations: stats._count,
      totalAmount: stats._sum.amount || 0,
    };
  }

  async getCampaignDonations(campaignId: string, pagination: PaginationParams = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where: { campaignId, paymentStatus: 'completed' },
        include: {
          user: {
            select: { username: true, fullName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.donation.count({ where: { campaignId, paymentStatus: 'completed' } }),
    ]);

    return { donations, total, page, limit };
  }
}
