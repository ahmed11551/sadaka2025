import { Response } from 'express';
import { CampaignService } from '../services/campaign.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';

export class CampaignController {
  private campaignService: CampaignService;

  constructor() {
    this.campaignService = new CampaignService();
  }

  getCampaigns = async (req: AuthRequest, res: Response) => {
    const {
      type,
      status,
      category,
      urgent,
      partnerId,
      authorId,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {
      ...(type && { type: type as 'fund' | 'private' }),
      ...(status && { status: status as 'active' | 'completed' | 'cancelled' }),
      ...(category && { category: category as string }),
      ...(urgent !== undefined && { urgent: urgent === 'true' }),
      ...(partnerId && { partnerId: partnerId as string }),
      ...(authorId && { authorId: authorId as string }),
      ...(search && { search: search as string }),
    };

    const result = await this.campaignService.getCampaigns(
      filters,
      { page: Number(page), limit: Number(limit) }
    );

    sendPaginated(res, result.campaigns, result.page, result.limit, result.total);
  };

  getCampaign = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const campaign = await this.campaignService.getCampaign(id);
    sendSuccess(res, campaign);
  };

  getCampaignBySlug = async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;
    const campaign = await this.campaignService.getCampaignBySlug(slug);
    sendSuccess(res, campaign);
  };

  createCampaign = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const campaign = await this.campaignService.createCampaign(userId, req.body);
    sendSuccess(res, campaign, 'Campaign created successfully', 201);
  };

  updateCampaign = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const campaign = await this.campaignService.updateCampaign(id, userId, req.body);
    sendSuccess(res, campaign, 'Campaign updated successfully');
  };

  deleteCampaign = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await this.campaignService.deleteCampaign(id, userId);
    sendSuccess(res, result);
  };

  getUserFavorites = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await this.campaignService.getUserFavorites(
      userId,
      { page: Number(page), limit: Number(limit) }
    );

    sendPaginated(res, result.campaigns, result.page, result.limit, result.total);
  };
}
