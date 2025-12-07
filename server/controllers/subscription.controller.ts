// Subscription Controller - Handle subscription-related endpoints

import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { SubscriptionService } from '../services/subscription.service';
import { sendSuccess, sendError } from '../utils/response';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * GET /subscriptions/me
   * Get current user's subscriptions
   */
  getMySubscriptions = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      const subscriptions = await this.subscriptionService.getUserSubscriptions(userId);
      return sendSuccess(res, subscriptions, 'Subscriptions retrieved successfully');
    } catch (error: any) {
      console.error('[SubscriptionController] Error getting subscriptions:', error);
      return sendError(res, error.message || 'Failed to get subscriptions', 500);
    }
  };

  /**
   * POST /subscriptions/checkout
   * Create new subscription
   */
  checkout = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      const { tier, billingCycle, amount } = req.body;

      // Map tier to planType
      const planTypeMap: Record<string, string> = {
        'muslim': 'muslim',
        'pro': 'pro',
        'premium': 'premium',
      };

      const planType = planTypeMap[tier] || tier;
      
      // Calculate charity percent based on tier
      const charityPercentMap: Record<string, number> = {
        'muslim': 0,
        'pro': 5,
        'premium': 10,
      };
      const charityPercent = charityPercentMap[planType] || 0;
      const charityAmount = (amount * charityPercent) / 100;

      const subscription = await this.subscriptionService.createSubscription(userId, {
        planType,
        planName: tier === 'muslim' ? 'Муслим' : tier === 'pro' ? 'Мутахсин' : 'Сахиб аль-Вакф',
        billingCycle: billingCycle || 'monthly',
        amount,
        charityPercent,
        charityAmount,
        paymentMethod: req.body.paymentMethod,
      });

      return sendSuccess(res, subscription, 'Subscription created successfully');
    } catch (error: any) {
      console.error('[SubscriptionController] Error creating subscription:', error);
      return sendError(res, error.message || 'Failed to create subscription', 500);
    }
  };

  /**
   * PATCH /subscriptions/:id
   * Update subscription (pause/resume/cancel)
   */
  updateSubscription = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Authentication required', 401);
      }

      const { id } = req.params;
      const { action } = req.body; // 'pause' | 'resume' | 'cancel'

      if (!['pause', 'resume', 'cancel'].includes(action)) {
        return sendError(res, 'Invalid action. Must be: pause, resume, or cancel', 400);
      }

      const subscription = await this.subscriptionService.updateSubscription(userId, id, action);
      return sendSuccess(res, subscription, `Subscription ${action}d successfully`);
    } catch (error: any) {
      console.error('[SubscriptionController] Error updating subscription:', error);
      return sendError(res, error.message || 'Failed to update subscription', 500);
    }
  };
}

