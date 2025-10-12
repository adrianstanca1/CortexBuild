/**
 * Subscription Management Service
 * Handles billing, payment processing, and subscription lifecycle
 */

import Database from 'better-sqlite3';
import Stripe from 'stripe';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  price: number; // Monthly price in cents
  requests: number;
  features: string[];
}

export interface SubscriptionData {
  userId: string;
  tier: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEndsAt?: Date;
}

export class SubscriptionService {
  private db: Database.Database;
  private stripe: Stripe;

  constructor(db: Database.Database) {
    this.db = db;

    // Initialize Stripe (only if API key is provided)
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-10-28.acacia',
      });
    }
  }

  /**
   * Get all available subscription plans
   */
  getPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'free',
        name: 'Free',
        tier: 'free',
        price: 0,
        requests: 100,
        features: [
          '100 AI requests/month',
          'Basic code generation',
          'Community support',
          'Standard models only'
        ]
      },
      {
        id: 'starter',
        name: 'Starter',
        tier: 'starter',
        price: 2900, // $29/month
        requests: 1000,
        features: [
          '1,000 AI requests/month',
          'Advanced code generation',
          'Priority support',
          'All AI models',
          'Basic analytics'
        ]
      },
      {
        id: 'pro',
        name: 'Professional',
        tier: 'pro',
        price: 9900, // $99/month
        requests: 10000,
        features: [
          '10,000 AI requests/month',
          'Advanced workflows',
          'Priority support',
          'All AI models',
          'Advanced analytics',
          'Custom integrations'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        tier: 'enterprise',
        price: 29900, // $299/month
        requests: 100000,
        features: [
          '100,000 AI requests/month',
          'Unlimited workflows',
          'Dedicated support',
          'All AI models',
          'Advanced analytics',
          'Custom integrations',
          'SLA guarantee',
          'Custom training'
        ]
      }
    ];
  }

  /**
   * Create or update Stripe customer
   */
  async createStripeCustomer(userId: string, email: string, name: string): Promise<string> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const existingCustomer = this.db.prepare(`
      SELECT stripe_customer_id FROM sdk_profiles WHERE user_id = ?
    `).get(userId);

    if (existingCustomer?.stripe_customer_id) {
      return existingCustomer.stripe_customer_id;
    }

    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: { userId }
    });

    // Update profile with Stripe customer ID
    this.db.prepare(`
      UPDATE sdk_profiles
      SET stripe_customer_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(customer.id, userId);

    return customer.id;
  }

  /**
   * Create Stripe subscription
   */
  async createSubscription(
    userId: string,
    priceId: string,
    paymentMethodId?: string
  ): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const profile = this.db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const customerId = profile.stripe_customer_id || await this.createStripeCustomer(
      userId,
      profile.email || '',
      profile.name || ''
    );

    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      metadata: { userId },
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    };

    if (paymentMethodId) {
      subscriptionData.default_payment_method = paymentMethodId;
    }

    const subscription = await this.stripe.subscriptions.create(subscriptionData);

    // Update profile with subscription details
    this.updateSubscriptionFromStripe(userId, subscription);

    return subscription;
  }

  /**
   * Update subscription from Stripe webhook data
   */
  updateSubscriptionFromStripe(userId: string, subscription: Stripe.Subscription): void {
    const currentPeriodStart = new Date(subscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    this.db.prepare(`
      UPDATE sdk_profiles
      SET subscription_status = ?,
          current_period_start = ?,
          current_period_end = ?,
          cancel_at_period_end = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      subscription.status,
      currentPeriodStart.toISOString(),
      currentPeriodEnd.toISOString(),
      subscription.cancel_at_period_end,
      userId
    );
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, cancelAtPeriodEnd = true): Promise<void> {
    const profile = this.db.prepare('SELECT * FROM sdk_profiles WHERE user_id = ?').get(userId);
    if (!profile?.stripe_customer_id) {
      throw new Error('No Stripe subscription found');
    }

    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    // Get active subscriptions for customer
    const subscriptions = await this.stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active'
    });

    if (subscriptions.data.length === 0) {
      throw new Error('No active subscription found');
    }

    const subscription = subscriptions.data[0];

    if (cancelAtPeriodEnd) {
      await this.stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true
      });
    } else {
      await this.stripe.subscriptions.cancel(subscription.id);
    }

    // Update local profile
    this.db.prepare(`
      UPDATE sdk_profiles
      SET cancel_at_period_end = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(cancelAtPeriodEnd, userId);
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          this.updateSubscriptionFromStripe(userId, subscription);

          // Record in history
          this.recordSubscriptionChange(
            userId,
            'existing',
            subscription.status,
            `Stripe ${event.type}`,
            'system',
            event.id
          );
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by Stripe customer ID
        const profile = this.db.prepare(`
          SELECT user_id FROM sdk_profiles WHERE stripe_customer_id = ?
        `).get(customerId);

        if (profile) {
          // Reset usage or extend trial
          this.db.prepare(`
            UPDATE sdk_profiles
            SET api_requests_used = 0, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `).run(profile.user_id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object as Stripe.Invoice;

        // Find user and mark as past_due
        const failedProfile = this.db.prepare(`
          SELECT user_id FROM sdk_profiles WHERE stripe_customer_id = ?
        `).get(failedInvoice.customer);

        if (failedProfile) {
          this.db.prepare(`
            UPDATE sdk_profiles
            SET subscription_status = 'past_due', updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `).run(failedProfile.user_id);

          // Create notification
          this.createNotification(
            failedProfile.user_id,
            'payment_failed',
            'Payment Failed',
            'Your subscription payment could not be processed. Please update your payment method.',
            { invoiceId: failedInvoice.id }
          );
        }
        break;
      }
    }
  }

  /**
   * Record subscription change in history
   */
  private recordSubscriptionChange(
    userId: string,
    oldTier: string,
    newTier: string,
    reason: string,
    changedBy: string,
    stripeEventId?: string
  ): void {
    const id = `sub-history-${Date.now()}`;

    this.db.prepare(`
      INSERT INTO subscription_history (id, user_id, old_tier, new_tier, change_reason, changed_by, stripe_event_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, oldTier, newTier, reason, changedBy, stripeEventId);
  }

  /**
   * Create subscription notification
   */
  private createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ): void {
    const id = `notif-${Date.now()}`;

    this.db.prepare(`
      INSERT INTO subscription_notifications (id, user_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, type, title, message, data ? JSON.stringify(data) : null);
  }

  /**
   * Get subscription analytics
   */
  getSubscriptionAnalytics(userId?: string): any {
    let whereClause = '';
    let params: any[] = [];

    if (userId) {
      whereClause = 'WHERE user_id = ?';
      params = [userId];
    }

    const subscriptions = this.db.prepare(`
      SELECT
        subscription_tier,
        subscription_status,
        COUNT(*) as count,
        AVG(api_requests_used) as avg_usage,
        AVG(api_requests_limit) as avg_limit
      FROM sdk_profiles
      ${whereClause}
      GROUP BY subscription_tier, subscription_status
    `).all(...params);

    const recentChanges = this.db.prepare(`
      SELECT
        new_tier,
        COUNT(*) as changes,
        DATE(created_at) as change_date
      FROM subscription_history
      ${userId ? 'WHERE user_id = ?' : ''}
      AND created_at >= date('now', '-30 days')
      GROUP BY new_tier, DATE(created_at)
      ORDER BY change_date DESC
    `).all(userId ? [userId] : []);

    return {
      subscriptions,
      recentChanges,
      summary: {
        totalSubscriptions: subscriptions.reduce((sum, s) => sum + s.count, 0),
        activeSubscriptions: subscriptions
          .filter(s => s.subscription_status === 'active')
          .reduce((sum, s) => sum + s.count, 0)
      }
    };
  }

  /**
   * Check and update subscription statuses
   */
  async updateSubscriptionStatuses(): Promise<void> {
    const now = new Date();

    // Find subscriptions that should be canceled
    const toCancel = this.db.prepare(`
      SELECT user_id FROM sdk_profiles
      WHERE cancel_at_period_end = 1
      AND current_period_end <= ?
    `).all(now.toISOString());

    for (const sub of toCancel) {
      this.db.prepare(`
        UPDATE sdk_profiles
        SET subscription_status = 'canceled',
            cancel_at_period_end = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(sub.user_id);

      this.createNotification(
        sub.user_id,
        'subscription_canceled',
        'Subscription Canceled',
        'Your subscription has been canceled as requested.'
      );
    }

    // Find trial subscriptions ending soon
    const trialsEnding = this.db.prepare(`
      SELECT user_id FROM sdk_profiles
      WHERE subscription_status = 'trialing'
      AND trial_ends_at <= date('now', '+3 days')
      AND trial_ends_at > date('now')
    `).all();

    for (const trial of trialsEnding) {
      const daysLeft = Math.ceil(
        (new Date(trial.trial_ends_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      this.createNotification(
        trial.user_id,
        'trial_ending',
        'Trial Ending Soon',
        `Your trial will end in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Upgrade to continue using premium features.`,
        { daysLeft }
      );
    }
  }
}

export const createSubscriptionService = (db: Database.Database): SubscriptionService => {
  return new SubscriptionService(db);
};
