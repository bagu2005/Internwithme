import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscriptionService';
import { createError } from './errorHandler';
import { AuthRequest } from './auth';

export const requireFeature = (feature: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser) {
        throw createError('Authentication required', 401);
      }

      const access = await subscriptionService.checkFeatureAccess(req.authUser.id, feature);
      
      if (!access.hasAccess) {
        const subscription = await subscriptionService.getUserSubscription(req.authUser.id);
        const plan = subscription.plan;
        
        throw createError(
          `This feature requires a ${plan.name === 'Free' ? 'Premium or Pro' : 'Pro'} subscription. Upgrade your plan to access this feature.`,
          403
        );
      }

      // Add usage info to request for potential use in controllers
      (req as any).featureAccess = access;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('Authentication required', 401);
    }

    const subscription = await subscriptionService.getUserSubscription(req.authUser.id);
    (req as any).subscription = subscription;
    next();
  } catch (error) {
    next(error);
  }
};
