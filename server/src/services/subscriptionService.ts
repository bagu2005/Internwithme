import { pool } from '../config/database';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: Record<string, number>;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
         free: {
           id: 'free',
           name: 'Free',
           price: 0,
           features: [
             'Basic profile',
             '3 applications per month',
             'Basic search filters',
             'Email notifications',
             'Basic internship browsing'
           ],
           limits: {
             applications: 3, // Limited to 3 applications per month
             premium_templates: 0
           }
         },
         premium: {
           id: 'premium',
           name: 'Premium',
           price: 9.99,
           features: [
             'Everything in Free',
             '15 applications per month',
             'Advanced search filters',
             'Application analytics',
             'Priority support',
             'Enhanced profile visibility'
           ],
           limits: {
             applications: 15, // 15 applications per month
             premium_templates: 3
           }
         },
         pro: {
           id: 'pro',
           name: 'Pro',
           price: 19.99,
           features: [
             'Everything in Premium',
             'Unlimited applications',
             'Company insights',
             'Salary data',
             'Smart notifications',
             'Priority application processing',
             'Dedicated support',
             'Advanced analytics dashboard'
           ],
           limits: {
             applications: -1, // unlimited applications
             premium_templates: -1 // unlimited
           }
         }
};

export const subscriptionService = {
  async getUserSubscription(userId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
        [userId, 'active']
      );
      
      if (result.rows.length === 0) {
        // Return free plan as default
        return {
          plan: SUBSCRIPTION_PLANS.free,
          status: 'active',
          current_period_end: null
        };
      }
      
      const subscription = result.rows[0];
      return {
        plan: SUBSCRIPTION_PLANS[subscription.plan] || SUBSCRIPTION_PLANS.free,
        status: subscription.status,
        current_period_end: subscription.current_period_end
      };
    } finally {
      client.release();
    }
  },

  async createSubscription(userId: string, planId: string, stripeData?: any) {
    const client = await pool.connect();
    try {
      // Cancel any existing active subscription
      await client.query(
        'UPDATE subscriptions SET status = $1 WHERE user_id = $2 AND status = $3',
        ['cancelled', userId, 'active']
      );

      // Create new subscription
      const result = await client.query(
        `INSERT INTO subscriptions (user_id, plan, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          planId,
          'active',
          stripeData?.subscription_id || null,
          stripeData?.customer_id || null,
          stripeData?.current_period_start || new Date(),
          stripeData?.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        ]
      );

      // Initialize feature usage tracking
      const plan = SUBSCRIPTION_PLANS[planId];
      for (const [feature, limit] of Object.entries(plan.limits)) {
        await client.query(
          `INSERT INTO subscription_features (user_id, feature, usage_count, limit_count, reset_date)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (user_id, feature) DO UPDATE SET
           limit_count = $4, reset_date = $5`,
          [
            userId,
            feature,
            0,
            limit,
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Reset in 30 days
          ]
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async checkFeatureAccess(userId: string, feature: string): Promise<{ hasAccess: boolean; remaining: number }> {
    const client = await pool.connect();
    try {
      const subscription = await this.getUserSubscription(userId);
      const plan = subscription.plan;
      
      // Check if feature is available in the plan
      if (!(feature in plan.limits)) {
        return { hasAccess: false, remaining: 0 };
      }

      const limit = plan.limits[feature];
      
      // Unlimited access
      if (limit === -1) {
        return { hasAccess: true, remaining: -1 };
      }

      // Check current usage
      const result = await client.query(
        'SELECT usage_count, limit_count FROM subscription_features WHERE user_id = $1 AND feature = $2',
        [userId, feature]
      );

      if (result.rows.length === 0) {
        // Initialize feature tracking
        await client.query(
          'INSERT INTO subscription_features (user_id, feature, usage_count, limit_count) VALUES ($1, $2, $3, $4)',
          [userId, feature, 0, limit]
        );
        return { hasAccess: true, remaining: limit };
      }

      const { usage_count, limit_count } = result.rows[0];
      const remaining = Math.max(0, limit_count - usage_count);
      
      return { hasAccess: remaining > 0, remaining };
    } finally {
      client.release();
    }
  },

  async incrementFeatureUsage(userId: string, feature: string, amount: number = 1) {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE subscription_features SET usage_count = usage_count + $1 WHERE user_id = $2 AND feature = $3',
        [amount, userId, feature]
      );
    } finally {
      client.release();
    }
  },

  async getFeatureUsage(userId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT feature, usage_count, limit_count FROM subscription_features WHERE user_id = $1',
        [userId]
      );
      
      const usage: Record<string, { used: number; limit: number; remaining: number }> = {};
      
      for (const row of result.rows) {
        const remaining = row.limit_count === -1 ? -1 : Math.max(0, row.limit_count - row.usage_count);
        usage[row.feature] = {
          used: row.usage_count,
          limit: row.limit_count,
          remaining
        };
      }
      
      return usage;
    } finally {
      client.release();
    }
  }
};
