import { Response } from 'express';
import { DonationService } from '../services/donation.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';

export class DonationController {
  private donationService: DonationService;

  constructor() {
    this.donationService = new DonationService();
  }

  createDonation = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const donation = await this.donationService.createDonation(userId, req.body);
    sendSuccess(res, donation, 'Donation initiated successfully', 201);
  };

  getUserDonations = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await this.donationService.getUserDonations(
      userId,
      { page: Number(page), limit: Number(limit) }
    );

    sendPaginated(res, result.donations, result.page, result.limit, result.total);
  };

  getCampaignDonations = async (req: AuthRequest, res: Response) => {
    const { campaignId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await this.donationService.getCampaignDonations(
      campaignId,
      { page: Number(page), limit: Number(limit) }
    );

    sendPaginated(res, result.donations, result.page, result.limit, result.total);
  };

  getUserStats = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const stats = await this.donationService.getUserStats(userId);
    sendSuccess(res, stats);
  };
}
