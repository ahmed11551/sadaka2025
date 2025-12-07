// Zakat Service - Handle zakat calculations and payments

import { ZakatRepository } from '../repositories/zakat.repository';
import { DonationService } from './donation.service';
// import { Prisma } from '@prisma/client'; // MongoDB only

export interface ZakatCalculationInput {
  assets: {
    cash_total?: number;
    gold_g?: number;
    silver_g?: number;
    business_goods_value?: number;
    investments?: number;
    receivables_collectible?: number;
  };
  debts_short_term?: number;
  nisab_currency?: string;
  nisab_value?: number;
  rate_percent?: number;
}

export interface ZakatCalculationResult {
  total_assets: number;
  total_liabilities: number;
  net_assets: number;
  above_nisab: boolean;
  zakat_due: number;
  nisab_value: number;
}

export class ZakatService {
  private zakatRepository: ZakatRepository;
  private donationService: DonationService;

  constructor() {
    this.zakatRepository = new ZakatRepository();
    this.donationService = new DonationService();
  }

  /**
   * Calculate zakat amount
   */
  async calculateZakat(userId: string, data: ZakatCalculationInput): Promise<ZakatCalculationResult> {
    // Calculate total assets
    const totalAssets = Object.values(data.assets || {}).reduce((sum, val) => sum + (val || 0), 0);
    
    // Calculate total liabilities
    const totalLiabilities = data.debts_short_term || 0;
    
    // Calculate net assets
    const netAssets = Math.max(0, totalAssets - totalLiabilities);
    
    // Get nisab value (default: 442000 RUB)
    const nisab = data.nisab_value || 442000;
    
    // Check if above nisab
    const aboveNisab = netAssets >= nisab;
    
    // Calculate zakat (default: 2.5%)
    const rate = (data.rate_percent || 2.5) / 100;
    const zakatDue = aboveNisab ? netAssets * rate : 0;

    // Save calculation to history
    await this.zakatRepository.create({
      userId,
      payloadJson: JSON.stringify(data),
      zakatDue: new Prisma.Decimal(zakatDue),
      aboveNisab,
    });

    return {
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      net_assets: netAssets,
      above_nisab: aboveNisab,
      zakat_due: zakatDue,
      nisab_value: nisab,
    };
  }

  /**
   * Pay zakat (creates donation with type 'zakat')
   */
  async payZakat(userId: string, data: {
    amount: number;
    currency?: string;
    fundId?: string;
    campaignId?: string;
  }) {
    // Create donation with type 'zakat'
    const donation = await this.donationService.createDonation(userId, {
      amount: data.amount,
      currency: data.currency || 'RUB',
      type: 'zakat',
      category: 'zakat',
      partnerId: data.fundId,
      campaignId: data.campaignId,
      paymentMethod: 'card',
    });

    return donation;
  }

  /**
   * Get user's zakat calculation history
   */
  async getHistory(userId: string, pagination: { page?: number; limit?: number } = {}) {
    return this.zakatRepository.findByUser(userId, pagination);
  }
}

