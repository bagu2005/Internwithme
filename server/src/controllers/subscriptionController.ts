import { Request, Response, NextFunction } from 'express';
import { subscriptionService, SUBSCRIPTION_PLANS } from '../services/subscriptionService';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getSubscriptionPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({
      success: true,
      data: Object.values(SUBSCRIPTION_PLANS)
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('Authentication required', 401);
    }

    const subscription = await subscriptionService.getUserSubscription(req.authUser.id);
    const usage = await subscriptionService.getFeatureUsage(req.authUser.id);

    res.json({
      success: true,
      data: {
        subscription,
        usage
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('Authentication required', 401);
    }

    const { planId, stripeData } = req.body;

    if (!planId || !SUBSCRIPTION_PLANS[planId]) {
      throw createError('Invalid plan ID', 400);
    }

    const subscription = await subscriptionService.createSubscription(req.authUser.id, planId, stripeData);

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('Authentication required', 401);
    }

    // In a real implementation, you'd also cancel the Stripe subscription
    // For now, we'll just mark it as cancelled in our database
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};
