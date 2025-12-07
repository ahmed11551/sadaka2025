// Admin Controller - Handle admin operations (moderation, stats, etc.)

import { Response } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { asyncHandler } from '../middleware/error';
import { requireAdmin } from '../middleware/admin';
import prisma from '../db/client';

export class AdminController {
  /**
   * GET /api/admin/stats
   * Get platform statistics
   */
  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const [
      totalCampaigns,
      activeCampaigns,
      pendingCampaigns,
      totalDonations,
      totalAmount,
      totalUsers,
      totalPartners,
    ] = await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'active', moderationStatus: 'approved' } }),
      prisma.campaign.count({ where: { moderationStatus: 'pending' } }),
      prisma.donation.count({ where: { paymentStatus: 'completed' } }),
      prisma.donation.aggregate({
        where: { paymentStatus: 'completed' },
        _sum: { amount: true },
      }),
      prisma.user.count(),
      prisma.partner.count({ where: { verified: true } }),
    ]);

    sendSuccess(res, {
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        pending: pendingCampaigns,
      },
      donations: {
        total: totalDonations,
        amount: totalAmount._sum.amount || 0,
      },
      users: {
        total: totalUsers,
      },
      partners: {
        total: totalPartners,
      },
    });
  });

  /**
   * GET /api/admin/campaigns/pending
   * Get campaigns pending moderation
   */
  getPendingCampaigns = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where: { moderationStatus: 'pending' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              email: true,
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
        skip,
        take: Number(limit),
      }),
      prisma.campaign.count({ where: { moderationStatus: 'pending' } }),
    ]);

    sendPaginated(res, campaigns, Number(page), Number(limit), total);
  });

  /**
   * POST /api/admin/campaigns/:id/approve
   * Approve campaign
   */
  approveCampaign = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { note } = req.body;

    const campaign = await prisma.campaign.findUnique({ where: { id } });

    if (!campaign) {
      return sendError(res, 'Campaign not found', 404);
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        moderationStatus: 'approved',
        moderationNote: note,
        moderatedAt: new Date(),
        moderatedBy: req.user!.id,
        status: 'active', // Activate campaign after approval
      },
    });

    sendSuccess(res, updated, 'Campaign approved successfully');
  });

  /**
   * POST /api/admin/campaigns/:id/reject
   * Reject campaign
   */
  rejectCampaign = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return sendError(res, 'Rejection note is required', 400);
    }

    const campaign = await prisma.campaign.findUnique({ where: { id } });

    if (!campaign) {
      return sendError(res, 'Campaign not found', 404);
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        moderationStatus: 'rejected',
        moderationNote: note,
        moderatedAt: new Date(),
        moderatedBy: req.user!.id,
        status: 'cancelled',
      },
    });

    sendSuccess(res, updated, 'Campaign rejected');
  });
}

