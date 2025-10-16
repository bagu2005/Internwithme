import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef');

export const stripeService = {
  // Create checkout session using Supabase Edge Functions
  async createCheckoutSession(planId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      // For demo purposes, simulate Stripe checkout
      const plans = {
        'free': { name: 'Free', price: 0, features: ['Browse jobs', 'Basic filtering', 'Apply to jobs'] },
        'premium': { name: 'Premium', price: 9.99, features: ['Unlimited applications', 'Advanced filtering', 'Priority support', 'Resume builder'] },
        'pro': { name: 'Pro', price: 19.99, features: ['Everything in Premium', 'AI job matching', 'Interview prep', 'Career coaching'] }
      };

      const plan = plans[planId as keyof typeof plans];
      
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Simulate successful subscription
      if (plan.price === 0) {
        // Free plan - no payment needed
        await this.updateUserSubscription(session.user.id, planId, 'active');
        return { success: true, message: 'Free plan activated successfully!' };
      } else {
        // Paid plan - simulate Stripe checkout
        const confirmed = window.confirm(
          `Subscribe to ${plan.name} plan for $${plan.price}/month?\n\nFeatures:\n${plan.features.map(f => `• ${f}`).join('\n')}\n\nThis is a demo - no real payment will be processed.`
        );
        
        if (confirmed) {
          await this.updateUserSubscription(session.user.id, planId, 'active');
          return { success: true, message: `${plan.name} plan activated successfully!` };
        } else {
          return { success: false, message: 'Subscription cancelled' };
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Update user subscription in Supabase
  async updateUserSubscription(userId: string, planId: string, status: string) {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          status: status,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating subscription:', error);
        // If table doesn't exist, store in localStorage as fallback
        localStorage.setItem('user_subscription', JSON.stringify({
          plan_id: planId,
          status: status,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
      }
    } catch (error) {
      console.error('Error in updateUserSubscription:', error);
      // Fallback to localStorage
      localStorage.setItem('user_subscription', JSON.stringify({
        plan_id: planId,
        status: status,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
    }
  },

  // Get current subscription
  async getCurrentSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      }

      if (data) {
        return data;
      }

      // Fallback to localStorage
      const localSubscription = localStorage.getItem('user_subscription');
      if (localSubscription) {
        return JSON.parse(localSubscription);
      }

      return null;
    } catch (error) {
      console.error('Error in getCurrentSubscription:', error);
      // Fallback to localStorage
      const localSubscription = localStorage.getItem('user_subscription');
      if (localSubscription) {
        return JSON.parse(localSubscription);
      }
      return null;
    }
  },

  // Cancel subscription
  async cancelSubscription(immediately: boolean = false) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const confirmed = window.confirm(
        immediately 
          ? 'Are you sure you want to cancel your subscription immediately? You will lose access to premium features right away.'
          : 'Are you sure you want to cancel your subscription? You will keep access until the end of your billing period.'
      );

      if (confirmed) {
        await this.updateUserSubscription(session.user.id, 'free', immediately ? 'cancelled' : 'cancelling');
        return { success: true, message: 'Subscription cancelled successfully' };
      } else {
        return { success: false, message: 'Cancellation cancelled' };
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Get subscription plans
  getPlans() {
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: [
          'Browse up to 50 jobs per day',
          'Basic job filtering',
          'Apply to 5 jobs per month',
          'Email support'
        ],
        limits: { applications: 5, searches: 50 }
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        interval: 'month',
        features: [
          'Unlimited job browsing',
          'Advanced filtering & search',
          'Unlimited applications',
          'Priority support',
          'Resume builder',
          'Application tracking'
        ],
        limits: { applications: -1, searches: -1 }
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 19.99,
        interval: 'month',
        features: [
          'Everything in Premium',
          'AI-powered job matching',
          'Interview preparation tools',
          'Career coaching sessions',
          'LinkedIn profile optimization',
          'Salary negotiation tips'
        ],
        limits: { applications: -1, searches: -1 }
      }
    ];
  }
};
