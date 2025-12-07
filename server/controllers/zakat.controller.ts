// Zakat Controller - Handle zakat-related endpoints

import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { ZakatService } from '../services/zakat.service';
import { sendSuccess, sendError } from '../utils/response';

export class ZakatController {
  private zakatService: ZakatService;

  constructor() {
    this.zakatService = new ZakatService();
  }

  /**
   * POST /zakat/calc
   * Calculate zakat amount
   */
  calculate = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      const calculation = await this.zakatService.calculateZakat(userId, req.body);
      return sendSuccess(res, calculation, 'Zakat calculated successfully');
    } catch (error: any) {
      console.error('[ZakatController] Error calculating zakat:', error);
      return sendError(res, error.message || 'Failed to calculate zakat', 500);
    }
  };

  /**
   * POST /zakat/pay
   * Pay zakat (creates donation)
   */
  pay = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      const { amount, currency, fundId, campaignId } = req.body;

      if (!amount || amount <= 0) {
        return sendError(res, 'Invalid zakat amount', 400);
      }

      const donation = await this.zakatService.payZakat(userId, {
        amount,
        currency,
        fundId,
        campaignId,
      });

      return sendSuccess(res, donation, 'Zakat payment initiated successfully');
    } catch (error: any) {
      console.error('[ZakatController] Error paying zakat:', error);
      return sendError(res, error.message || 'Failed to pay zakat', 500);
    }
  };

  /**
   * GET /zakat/history
   * Get user's zakat calculation history
   */
  getHistory = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const history = await this.zakatService.getHistory(userId, { page, limit });
      return sendSuccess(res, history, 'Zakat history retrieved successfully');
    } catch (error: any) {
      console.error('[ZakatController] Error getting zakat history:', error);
      return sendError(res, error.message || 'Failed to get zakat history', 500);
    }
  };
}

