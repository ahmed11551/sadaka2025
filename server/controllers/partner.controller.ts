import { Request, Response } from 'express';
import { PartnerService } from '../services/partner.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class PartnerController {
  private partnerService: PartnerService;

  constructor() {
    this.partnerService = new PartnerService();
  }

  getPartners = async (req: Request, res: Response) => {
    const { country, city, type, verified, page = 1, limit = 10 } = req.query;

    const filters = {
      ...(country && { country: country as string }),
      ...(city && { city: city as string }),
      ...(type && { type: type as string }),
      ...(verified !== undefined && { verified: verified === 'true' }),
    };

    const result = await this.partnerService.getPartners(
      filters,
      { page: Number(page), limit: Number(limit) }
    );

    sendPaginated(res, result.partners, result.page, result.limit, result.total);
  };

  getPartner = async (req: Request, res: Response) => {
    const { id } = req.params;
    const partner = await this.partnerService.getPartner(id);
    sendSuccess(res, partner);
  };

  getPartnerBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const partner = await this.partnerService.getPartnerBySlug(slug);
    sendSuccess(res, partner);
  };

  createPartner = async (req: Request, res: Response) => {
    const partner = await this.partnerService.createPartner(req.body);
    sendSuccess(res, partner, 'Partner created successfully', 201);
  };

  updatePartner = async (req: Request, res: Response) => {
    const { id } = req.params;
    const partner = await this.partnerService.updatePartner(id, req.body);
    sendSuccess(res, partner, 'Partner updated successfully');
  };

  getPartnerCampaigns = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await this.partnerService.getPartnerCampaigns(
      id,
      { page: Number(page), limit: Number(limit) }
    );

    sendPaginated(res, result.campaigns, result.page, result.limit, result.total);
  };
}
