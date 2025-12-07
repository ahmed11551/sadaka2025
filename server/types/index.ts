import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CampaignFilters {
  type?: 'fund' | 'private';
  status?: 'active' | 'completed' | 'cancelled';
  category?: string;
  urgent?: boolean;
  partnerId?: string;
  authorId?: string;
  search?: string;
}

export interface DonationCreateInput {
  amount: number;
  currency?: string;
  type: string;
  category?: string;
  campaignId?: string;
  partnerId?: string;
  anonymous?: boolean;
  comment?: string;
  paymentMethod?: string;
}

export interface SubscriptionCreateInput {
  planType: string;
  billingCycle: string;
  amount: number;
  charityPercent: number;
  paymentMethod?: string;
}
