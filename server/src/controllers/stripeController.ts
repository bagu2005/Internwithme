import { Request, Response, NextFunction } from 'express';
import { stripeService } from '../services/stripeService';
import { subscriptionService } from '../services/subscriptionService';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const createCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('Authentication required', 401);
    }

    const { planId } = req.body;
    const { successUrl, cancelUrl } = req.body;

    if (!planId || !successUrl || !cancelUrl) {
      throw createError('Plan ID, success URL, and cancel URL are required', 400);
    }

    // Check if plan exists
    const { SUBSCRIPTION_PLANS } = await import('../services/subscriptionService');
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw createError('Invalid plan ID', 400);
    }

    // Skip checkout for free plan
    if (planId === 'free') {
      await subscriptionService.createSubscription(req.authUser.id, planId);
      res.json({
        success: true,
        data: { url: successUrl }
      });
      return;
    }

    // Create or get Stripe customer
    let customerId = (req.authUser as any).stripeCustomerId;
    if (!customerId) {
      // Fetch user data from database to get name
      const { pool } = await import('../config/database');
      const client = await pool.connect();
      try {
        const userResult = await client.query(
          'SELECT first_name, last_name, stripe_customer_id FROM users WHERE id = $1',
          [req.authUser.id]
        );
        
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          customerId = user.stripe_customer_id;
          
          if (!customerId) {
            const customer = await stripeService.createCustomer(
              req.authUser.email,
              `${user.first_name || 'User'} ${user.last_name || ''}`
            );
            customerId = customer.id;
            
            // Update user with Stripe customer ID
            await client.query(
              'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
              [customerId, req.authUser.id]
            );
          }
        }
      } finally {
        client.release();
      }
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      customerId,
      planId,
      successUrl,
      cancelUrl
    );

    res.json({
      success: true,
      data: { url: session.url }
    });
  } catch (error) {
    next(error);
  }
};

export const createPortalSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('Authentication required', 401);
    }

    const { returnUrl } = req.body;

    if (!returnUrl) {
      throw createError('Return URL is required', 400);
    }

    // Get user's Stripe customer ID from database
    const { pool } = await import('../config/database');
    const client = await pool.connect();
    try {
      const userResult = await client.query(
        'SELECT stripe_customer_id FROM users WHERE id = $1',
        [req.authUser.id]
      );
      
      if (userResult.rows.length === 0) {
        throw createError('User not found', 404);
      }
      
      const customerId = userResult.rows[0].stripe_customer_id;
      if (!customerId) {
        throw createError('No Stripe customer found. Please subscribe to a plan first.', 400);
      }

      // Create portal session
      const session = await stripeService.createPortalSession(customerId, returnUrl);

      res.json({
        success: true,
        data: { url: session.url }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.body;

    if (!signature) {
      throw createError('Missing Stripe signature', 400);
    }

    // Handle the webhook
    const result = await stripeService.handleWebhook(payload, signature);

    // Update subscription in database based on webhook event
    if (result) {
      // This would update the subscription status in the database
      console.log('Webhook processed:', result);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('Authentication required', 401);
    }

    const { immediately = false } = req.body;

    // Get user's current subscription
    const subscription = await subscriptionService.getUserSubscription(req.authUser.id);
    
    if (!(subscription as any).stripeSubscriptionId) {
      throw createError('No active subscription found', 400);
    }

    // Cancel subscription in Stripe
    await stripeService.cancelSubscription((subscription as any).stripeSubscriptionId, immediately);

    // Update subscription status in database
    // This would require updating the subscription status

    res.json({
      success: true,
      message: immediately ? 'Subscription cancelled immediately' : 'Subscription will be cancelled at the end of the billing period'
    });
  } catch (error) {
    next(error);
  }
};
