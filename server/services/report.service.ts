// Report Service - Generate PDF/CSV reports for donations, campaigns, funds

import prisma from '../db/client';
import { Prisma } from '@prisma/client';

export interface ReportFilters {
  userId?: string;
  campaignId?: string;
  partnerId?: string;
  fromDate?: Date;
  toDate?: Date;
  type?: string;
  category?: string;
}

export class ReportService {
  /**
   * Get donations for report
   */
  async getDonationsForReport(filters: ReportFilters = {}) {
    const where: Prisma.DonationWhereInput = {
      paymentStatus: 'completed',
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.campaignId && { campaignId: filters.campaignId }),
      ...(filters.partnerId && { partnerId: filters.partnerId }),
      ...(filters.type && { type: filters.type }),
      ...(filters.category && { category: filters.category }),
      ...(filters.fromDate || filters.toDate) && {
        createdAt: {
          ...(filters.fromDate && { gte: filters.fromDate }),
          ...(filters.toDate && { lte: filters.toDate }),
        },
      },
    };

    return prisma.donation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Generate CSV report
   */
  async generateCSVReport(filters: ReportFilters = {}): Promise<string> {
    const donations = await this.getDonationsForReport(filters);

    // CSV header
    const headers = [
      'ID',
      'Дата',
      'Сумма',
      'Валюта',
      'Тип',
      'Категория',
      'Пользователь',
      'Кампания',
      'Фонд',
      'Комментарий',
      'Анонимно',
    ];

    // CSV rows
    const rows = donations.map((donation) => [
      donation.id,
      donation.createdAt.toISOString(),
      donation.amount.toString(),
      donation.currency,
      donation.type,
      donation.category || '',
      donation.anonymous ? 'Анонимно' : (donation.user?.fullName || donation.user?.username || ''),
      donation.campaign?.title || '',
      donation.partner?.name || '',
      donation.comment || '',
      donation.anonymous ? 'Да' : 'Нет',
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Generate summary statistics
   */
  async getSummaryStats(filters: ReportFilters = {}) {
    const donations = await this.getDonationsForReport(filters);

    const totalAmount = donations.reduce(
      (sum, donation) => sum + Number(donation.amount),
      0
    );

    const byType = donations.reduce((acc, donation) => {
      acc[donation.type] = (acc[donation.type] || 0) + Number(donation.amount);
      return acc;
    }, {} as Record<string, number>);

    const byCategory = donations.reduce((acc, donation) => {
      const category = donation.category || 'other';
      acc[category] = (acc[category] || 0) + Number(donation.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDonations: donations.length,
      totalAmount,
      byType,
      byCategory,
      period: {
        from: filters.fromDate || donations[donations.length - 1]?.createdAt,
        to: filters.toDate || donations[0]?.createdAt,
      },
    };
  }
}

