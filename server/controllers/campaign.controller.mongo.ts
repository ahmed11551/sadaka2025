// Контроллер кампаний с использованием MongoDB
import { Request, Response } from 'express';
import { CampaignRepositoryMongo } from '../repositories/campaign.repository.mongo.js';
import { NotFoundError, UnauthorizedError } from '../utils/errors.js';

export class CampaignControllerMongo {
  private campaignRepo: CampaignRepositoryMongo;

  constructor() {
    this.campaignRepo = new CampaignRepositoryMongo();
  }

  // Получить все кампании
  async getAll(req: Request, res: Response) {
    const {
      status = 'active',
      type,
      partnerId,
      moderationStatus = 'approved',
      urgent,
      category,
      limit = 20,
      offset = 0,
    } = req.query;

    const campaigns = await this.campaignRepo.findMany({
      status: status as string,
      type: type as string,
      partnerId: partnerId as string,
      moderationStatus: moderationStatus as string,
      urgent: urgent === 'true',
      category: category as string,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });

    const total = await this.campaignRepo.count({
      status: status as string,
      moderationStatus: moderationStatus as string,
    });

    res.json({
      success: true,
      data: {
        items: campaigns,
        total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      },
    });
  }

  // Получить кампанию по ID
  async getById(req: Request, res: Response) {
    const { id } = req.params;

    const campaign = await this.campaignRepo.findById(id);
    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    res.json({
      success: true,
      data: { campaign },
    });
  }

  // Создать кампанию
  async create(req: Request, res: Response) {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      throw new UnauthorizedError('Not authenticated');
    }

    const {
      title,
      description,
      fullDescription,
      category,
      image,
      goal,
      currency = 'RUB',
      type = 'private',
      deadline,
      partnerId,
    } = req.body;

    // Генерация slug из title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const campaign = await this.campaignRepo.create({
      title,
      slug,
      description,
      fullDescription,
      category,
      image,
      goal: parseFloat(goal),
      collected: 0,
      currency,
      type,
      status: 'active',
      urgent: false,
      verified: false,
      moderationStatus: 'pending',
      moderationNote: undefined,
      moderatedAt: undefined,
      moderatedBy: undefined,
      participantCount: 0,
      deadline: deadline ? new Date(deadline) : undefined,
      completedAt: undefined,
      partnerId,
      authorId: userId,
    });

    res.status(201).json({
      success: true,
      data: {
        campaign,
        message: 'Campaign created successfully',
      },
    });
  }

  // Обновить кампанию
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const userId = (req.session as any)?.userId;

    const campaign = await this.campaignRepo.findById(id);
    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    // Проверка прав (только автор или админ)
    if (campaign.authorId !== userId && (req.session as any)?.userRole !== 'admin') {
      throw new UnauthorizedError('Not authorized to update this campaign');
    }

    const updateData: any = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.goal) updateData.goal = parseFloat(req.body.goal);
    if (req.body.deadline) updateData.deadline = new Date(req.body.deadline);

    const updatedCampaign = await this.campaignRepo.update(id, updateData);

    res.json({
      success: true,
      data: {
        campaign: updatedCampaign,
        message: 'Campaign updated successfully',
      },
    });
  }

  // Удалить кампанию
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const userId = (req.session as any)?.userId;

    const campaign = await this.campaignRepo.findById(id);
    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    // Проверка прав
    if (campaign.authorId !== userId && (req.session as any)?.userRole !== 'admin') {
      throw new UnauthorizedError('Not authorized to delete this campaign');
    }

    await this.campaignRepo.delete(id);

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  }
}

