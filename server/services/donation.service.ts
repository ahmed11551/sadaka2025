import { DonationRepository } from '../repositories/donation.repository';
import { CampaignRepository } from '../repositories/campaign.repository';
import { PartnerRepository } from '../repositories/partner.repository';
import { DonationCreateInput, PaginationParams } from '../types';
import { NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export class DonationService {
  private donationRepository: DonationRepository;
  private campaignRepository: CampaignRepository;
  private partnerRepository: PartnerRepository;

  constructor() {
    this.donationRepository = new DonationRepository();
    this.campaignRepository = new CampaignRepository();
    this.partnerRepository = new PartnerRepository();
  }

  async createDonation(userId: string | undefined, data: DonationCreateInput) {
    const donationData: Prisma.DonationCreateInput = {
      amount: new Prisma.Decimal(data.amount),
      currency: data.currency || 'RUB',
      type: data.type,
      category: data.category,
      anonymous: data.anonymous || false,
      comment: data.comment,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'pending',
      ...(userId && { user: { connect: { id: userId } } }),
      ...(data.campaignId && { campaign: { connect: { id: data.campaignId } } }),
      ...(data.partnerId && { partner: { connect: { id: data.partnerId } } }),
    };

    const donation = await this.donationRepository.create(donationData);

    // Simulate payment processing
    setTimeout(async () => {
      await this.completeDonation(donation.id);
    }, 1000);

    return donation;
  }

  async completeDonation(donationId: string) {
    const donation = await this.donationRepository.findById(donationId);
    if (!donation) return;

    await this.donationRepository.updateStatus(
      donationId,
      'completed',
      `TXN-${Date.now()}`
    );

    if (donation.campaignId) {
      await this.campaignRepository.addDonation(
        donation.campaignId,
        Number(donation.amount)
      );
      await this.campaignRepository.checkCompletion(donation.campaignId);
    }

    if (donation.partnerId) {
      await this.partnerRepository.updateStats(donation.partnerId);
    }
  }

  async getUserDonations(userId: string, pagination: PaginationParams = {}) {
    return this.donationRepository.findByUser(userId, pagination);
  }

  async getCampaignDonations(campaignId: string, pagination: PaginationParams = {}) {
    return this.donationRepository.getCampaignDonations(campaignId, pagination);
  }

  async getUserStats(userId: string) {
    return this.donationRepository.getUserStats(userId);
  }
}
