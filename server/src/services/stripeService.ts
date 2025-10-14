import Stripe from 'stripe';
import { SUBSCRIPTION_PLANS } from './subscriptionService';

// Initialize Stripe with secret key (only if key is provided)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  : null;

export const stripeService = {
  // Create a Stripe customer
  async createCustomer(email: string, name: string) {
    try {
      if (!stripe) {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.');
      }
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          source: 'internwithme'
        }
      });
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  },

  // Create a checkout session for subscription
  async createCheckoutSession(customerId: string, planId: string, successUrl: string, cancelUrl: string) {
    try {
      if (!stripe) {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.');
      }
      const plan = SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        throw new Error('Invalid plan ID');
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${plan.name} Plan`,
                description: plan.features.join(', '),
              },
              unit_amount: Math.round(plan.price * 100), // Convert to cents
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          planId,
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  },

  // Create a portal session for subscription management
  async createPortalSession(customerId: string, returnUrl: string) {
    try {
      if (!stripe) {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.');
      }
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return session;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  },

  // Handle webhook events
  async handleWebhook(payload: string, signature: string) {
    try {
      if (!stripe) {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.');
      }
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('Webhook secret not configured');
      }

             const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        case 'invoice.payment_failed':
          return await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        default:
          console.log(`Unhandled event type: ${event.type}`);
          return null;
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  },

  // Handle successful checkout
  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    try {
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const planId = session.metadata?.planId;

      if (!customerId || !subscriptionId || !planId) {
        throw new Error('Missing required session data');
      }

             // Get subscription details
             const subscription = await stripe!.subscriptions.retrieve(subscriptionId);
      
      return {
        customerId,
        subscriptionId,
        planId,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      };
    } catch (error) {
      console.error('Error handling checkout completion:', error);
      throw error;
    }
  },

  // Handle subscription updates
  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      return {
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      };
    } catch (error) {
      console.error('Error handling subscription update:', error);
      throw error;
    }
  },

  // Handle subscription deletion
  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      return {
        subscriptionId: subscription.id,
        status: 'cancelled',
        cancelledAt: new Date(subscription.canceled_at! * 1000),
      };
    } catch (error) {
      console.error('Error handling subscription deletion:', error);
      throw error;
    }
  },

  // Handle payment failures
  async handlePaymentFailed(invoice: Stripe.Invoice) {
    try {
      return {
        customerId: invoice.customer as string,
        subscriptionId: (invoice as any).subscription as string,
        amount: invoice.amount_due,
        attemptCount: invoice.attempt_count,
      };
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  },

  // Get subscription details
  async getSubscription(subscriptionId: string) {
    try {
      if (!stripe) {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.');
      }
             const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw new Error('Failed to retrieve subscription');
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, immediately: boolean = false) {
    try {
      if (!stripe) {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.');
      }
             if (immediately) {
               await stripe.subscriptions.cancel(subscriptionId);
             } else {
               await stripe.subscriptions.update(subscriptionId, {
                 cancel_at_period_end: true,
               });
             }
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }
};
