// Telegram Controller - Handle Telegram bot webhook and commands

import { Response } from 'express';
import { asyncHandler } from '../middleware/error';
import { sendSuccess, sendError } from '../utils/response';
import { TelegramBotService } from '../services/telegram/bot.service';

export class TelegramController {
  private botService: TelegramBotService;

  constructor() {
    this.botService = new TelegramBotService();
  }

  /**
   * POST /api/telegram/webhook
   * Telegram Bot API webhook handler
   */
  handleWebhook = asyncHandler(async (req: any, res: Response) => {
    const { message, callback_query } = req.body;

    // Handle commands
    if (message && message.text) {
      const text = message.text.toLowerCase();

      if (text.startsWith('/sadaqa')) {
        const response = this.botService.getSadaqaCommand();
        // In real implementation, send message via bot API
        return sendSuccess(res, { command: 'sadaqa', response });
      }

      if (text.startsWith('/zakat')) {
        const response = this.botService.getZakatCommand();
        return sendSuccess(res, { command: 'zakat', response });
      }

      if (text.startsWith('/campaigns')) {
        const response = this.botService.getCampaignsCommand();
        return sendSuccess(res, { command: 'campaigns', response });
      }

      if (text.startsWith('/partners')) {
        const response = this.botService.getPartnersCommand();
        return sendSuccess(res, { command: 'partners', response });
      }
    }

    // Handle callback queries
    if (callback_query && callback_query.data) {
      const { action, params } = this.botService.parseCallbackData(callback_query.data);

      if (action === 'donate') {
        const amount = params.amount ? parseFloat(params.amount) : 0;
        const fundId = params.fund;

        // Generate Mini App URL for donation
        const miniAppUrl = this.botService.generateMiniAppUrl('/', {
          action: 'donate',
          amount: amount.toString(),
          ...(fundId && { fund: fundId }),
        });

        return sendSuccess(res, {
          action: 'donate',
          miniAppUrl,
          params,
        });
      }
    }

    // Always return OK to Telegram
    res.status(200).json({ ok: true });
  });
}

