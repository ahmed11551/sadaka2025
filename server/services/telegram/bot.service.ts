// Telegram Bot Service - Handle inline commands and callback data
// Documentation: https://core.telegram.org/bots/api

// Optional dependency - telegraf package
let Telegram: any = null;
try {
  const telegraf = await import('telegraf');
  Telegram = telegraf.Telegram;
} catch (e) {
  console.warn('[TelegramBot] telegraf package not installed. Telegram features will be disabled.');
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE_URL = process.env.SITE_URL || 'https://sadaka2025.vercel.app';

export class TelegramBotService {
  private bot: any = null;

  constructor() {
    if (TELEGRAM_BOT_TOKEN && Telegram) {
      this.bot = new Telegram(TELEGRAM_BOT_TOKEN);
    } else {
      if (!TELEGRAM_BOT_TOKEN) {
        console.warn('[TelegramBot] TELEGRAM_BOT_TOKEN not configured');
      }
      if (!Telegram) {
        console.warn('[TelegramBot] telegraf package not installed');
      }
    }
  }

  /**
   * Parse callback data
   * Format: action:param1=value1;param2=value2
   */
  parseCallbackData(data: string): { action: string; params: Record<string, string> } {
    const [action, paramsString] = data.split(':');
    const params: Record<string, string> = {};

    if (paramsString) {
      paramsString.split(';').forEach((param) => {
        const [key, value] = param.split('=');
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      });
    }

    return { action, params };
  }

  /**
   * Generate callback data
   */
  generateCallbackData(action: string, params: Record<string, string>): string {
    const paramsString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join(';');

    return paramsString ? `${action}:${paramsString}` : action;
  }

  /**
   * Generate inline keyboard for donation
   */
  generateDonationKeyboard(amounts: number[], fundId?: string) {
    return {
      inline_keyboard: amounts.map((amount) => [
        {
          text: `${amount} ₽`,
          callback_data: this.generateCallbackData('donate', {
            amount: amount.toString(),
            ...(fundId && { fund: fundId }),
          }),
        },
      ]),
    };
  }

  /**
   * Generate Mini App URL
   */
  generateMiniAppUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, SITE_URL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return url.toString();
  }

  /**
   * Handle /sadaqa command
   */
  getSadaqaCommand() {
    return {
      text: 'Открыть раздел пожертвований',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Быстрые пожертвования',
              web_app: { url: this.generateMiniAppUrl('/') },
            },
          ],
          [
            {
              text: 'Все кампании',
              web_app: { url: this.generateMiniAppUrl('/campaigns') },
            },
          ],
          [
            {
              text: 'Фонды-партнёры',
              web_app: { url: this.generateMiniAppUrl('/partners') },
            },
          ],
        ],
      },
    };
  }

  /**
   * Handle /zakat command
   */
  getZakatCommand() {
    return {
      text: 'Открыть калькулятор закята',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Рассчитать закят',
              web_app: { url: this.generateMiniAppUrl('/zakat') },
            },
          ],
        ],
      },
    };
  }

  /**
   * Handle /campaigns command
   */
  getCampaignsCommand() {
    return {
      text: 'Открыть список кампаний',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Все кампании',
              web_app: { url: this.generateMiniAppUrl('/campaigns') },
            },
          ],
        ],
      },
    };
  }

  /**
   * Handle /partners command
   */
  getPartnersCommand() {
    return {
      text: 'Открыть каталог фондов',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Все фонды',
              web_app: { url: this.generateMiniAppUrl('/partners') },
            },
          ],
        ],
      },
    };
  }
}

