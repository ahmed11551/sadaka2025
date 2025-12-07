import { Response } from 'express';
import { FavoriteService } from '../services/favorite.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class FavoriteController {
  private favoriteService: FavoriteService;

  constructor() {
    this.favoriteService = new FavoriteService();
  }

  toggleFavorite = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { campaignId } = req.body;
    
    const result = await this.favoriteService.toggleFavorite(userId, campaignId);
    sendSuccess(res, result);
  };

  getUserFavorites = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const favorites = await this.favoriteService.getUserFavorites(userId);
    sendSuccess(res, { campaignIds: favorites });
  };

  checkFavorite = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { campaignId } = req.params;
    
    const isFavorite = await this.favoriteService.isFavorite(userId, campaignId);
    sendSuccess(res, { isFavorite });
  };
}
