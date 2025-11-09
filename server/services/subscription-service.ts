import Database from 'better-sqlite3';
import Stripe from 'stripe';

// Initialize Stripe only if key is provided
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development';
const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia'
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  limits: {
    maxFlows: number;
    maxRuns: number;
    maxSandboxRuns: number;
    maxAIQueries: number;
    maxAPICallsPerMinute: number;
    maxTeamMembers: number;
    maxStorageGB: number;
  };
  features: {
    customDomain: boolean;
    whiteLabel: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    customIntegrations: boolean;
    ssoEnabled: boolean;
  };
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  companyId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface UsageMetrics {
  userId: string;
  companyId: string;
  period: string; // YYYY-MM format
  flowRuns: number;
  sandboxRuns: number;
  aiQueries: number;
  apiCalls: number;
  storageGB: number;
}

export class SubscriptionService {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.initializeTables();
    this.seedPlans();
  }

  private initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
        price REAL NOT NULL,
        billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
        max_flows INTEGER NOT NULL,
        max_runs INTEGER NOT NULL,
        max_sandbox_runs INTEGER NOT NULL,
        max_ai_queries INTEGER NOT NULL,
        max_api_calls_per_minute INTEGER NOT NULL,
        max_team_members INTEGER NOT NULL,
        max_storage_gb INTEGER NOT NULL,
        custom_domain INTEGER DEFAULT 0,
        white_label INTEGER DEFAULT 0,
        priority_support INTEGER DEFAULT 0,
        advanced_analytics INTEGER DEFAULT 0,
        custom_integrations INTEGER DEFAULT 0,
        sso_enabled INTEGER DEFAULT 0,
        stripe_product_id TEXT,
        stripe_price_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        plan_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
        current_period_start DATETIME NOT NULL,
        current_period_end DATETIME NOT NULL,
        cancel_at_period_end INTEGER DEFAULT 0,
        stripe_subscription_id TEXT,
        stripe_customer_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
      );

      CREATE TABLE IF NOT EXISTS usage_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        period TEXT NOT NULL,
        flow_runs INTEGER DEFAULT 0,
        sandbox_runs INTEGER DEFAULT 0,
        ai_queries INTEGER DEFAULT 0,
        api_calls INTEGER DEFAULT 0,
        storage_gb REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (company_id) REFERENCES companies(id),
        UNIQUE(user_id, company_id, period)
      );

      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_company ON user_subscriptions(company_id);
      CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON usage_metrics(period);
    `);
  }

  private seedPlans() {
    const existingPlans = this.db.prepare('SELECT COUNT(*) as count FROM subscription_plans').get() as { count: number };
    
    if (existingPlans.count === 0) {
      const plans: SubscriptionPlan[] = [
        {
          id: 'plan-free',
          name: 'Free',
          tier: 'free',
          price: 0,
          billingPeriod: 'monthly',
          limits: {
            maxFlows: 3,
            maxRuns: 100,
            maxSandboxRuns: 10,
            maxAIQueries: 50,
            maxAPICallsPerMinute: 10,
            maxTeamMembers: 1,
            maxStorageGB: 1
          },
          features: {
            customDomain: false,
            whiteLabel: false,
            prioritySupport: false,
            advancedAnalytics: false,
            customIntegrations: false,
            ssoEnabled: false
          }
        },
        {
          id: 'plan-pro-monthly',
          name: 'Pro',
          tier: 'pro',
          price: 49,
          billingPeriod: 'monthly',
          limits: {
            maxFlows: 50,
            maxRuns: 5000,
            maxSandboxRuns: 100,
            maxAIQueries: 1000,
            maxAPICallsPerMinute: 100,
            maxTeamMembers: 10,
            maxStorageGB: 50
          },
          features: {
            customDomain: false,
            whiteLabel: false,
            prioritySupport: true,
            advancedAnalytics: true,
            customIntegrations: true,
            ssoEnabled: false
          }
        },
        {
          id: 'plan-enterprise-monthly',
          name: 'Enterprise',
          tier: 'enterprise',
          price: 199,
          billingPeriod: 'monthly',
          limits: {
            maxFlows: -1, // unlimited
            maxRuns: -1,
            maxSandboxRuns: -1,
            maxAIQueries: -1,
            maxAPICallsPerMinute: 1000,
            maxTeamMembers: -1,
            maxStorageGB: 500
          },
          features: {
            customDomain: true,
            whiteLabel: true,
            prioritySupport: true,
            advancedAnalytics: true,
            customIntegrations: true,
            ssoEnabled: true
          }
        }
      ];

      const stmt = this.db.prepare(`
        INSERT INTO subscription_plans (
          id, name, tier, price, billing_period,
          max_flows, max_runs, max_sandbox_runs, max_ai_queries,
          max_api_calls_per_minute, max_team_members, max_storage_gb,
          custom_domain, white_label, priority_support,
          advanced_analytics, custom_integrations, sso_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const plan of plans) {
        stmt.run(
          plan.id,
          plan.name,
          plan.tier,
          plan.price,
          plan.billingPeriod,
          plan.limits.maxFlows,
          plan.limits.maxRuns,
          plan.limits.maxSandboxRuns,
          plan.limits.maxAIQueries,
          plan.limits.maxAPICallsPerMinute,
          plan.limits.maxTeamMembers,
          plan.limits.maxStorageGB,
          plan.features.customDomain ? 1 : 0,
          plan.features.whiteLabel ? 1 : 0,
          plan.features.prioritySupport ? 1 : 0,
          plan.features.advancedAnalytics ? 1 : 0,
          plan.features.customIntegrations ? 1 : 0,
          plan.features.ssoEnabled ? 1 : 0
        );
      }

      console.log('✅ Subscription plans seeded');
    }
  }

  // Get all available plans
  getAllPlans(): SubscriptionPlan[] {
    const rows = this.db.prepare('SELECT * FROM subscription_plans ORDER BY price ASC').all();
    return rows.map((row: any) => this.mapRowToPlan(row));
  }

  // Get plan by ID
  getPlanById(planId: string): SubscriptionPlan | null {
    const row = this.db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(planId);
    return row ? this.mapRowToPlan(row) : null;
  }

  // Get user's active subscription
  getUserSubscription(userId: string, companyId: string): UserSubscription | null {
    const row = this.db.prepare(`
      SELECT * FROM user_subscriptions 
      WHERE user_id = ? AND company_id = ? AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `).get(userId, companyId);
    
    return row ? this.mapRowToSubscription(row) : null;
  }

  // Create free subscription for new user
  async createFreeSubscription(userId: string, companyId: string): Promise<UserSubscription> {
    const freePlan = this.getPlanById('plan-free');
    if (!freePlan) {
      throw new Error('Free plan not found');
    }

    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 100); // "Forever" for free plan

    this.db.prepare(`
      INSERT INTO user_subscriptions (
        id, user_id, company_id, plan_id, status,
        current_period_start, current_period_end, cancel_at_period_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      subscriptionId,
      userId,
      companyId,
      'plan-free',
      'active',
      now.toISOString(),
      endDate.toISOString(),
      0
    );

    return this.getUserSubscription(userId, companyId)!;
  }

  // Upgrade to paid plan via Stripe
  async upgradeToPaidPlan(
    userId: string,
    companyId: string,
    planId: string,
    stripePaymentMethodId: string
  ): Promise<UserSubscription> {
    const plan = this.getPlanById(planId);
    if (!plan || plan.tier === 'free') {
      throw new Error('Invalid plan for upgrade');
    }

    // Get or create Stripe customer
    const user = this.db.prepare('SELECT email, name FROM users WHERE id = ?').get(userId) as any;
    
    let customer: Stripe.Customer;
    const existingSub = this.getUserSubscription(userId, companyId);
    
    if (existingSub?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(existingSub.stripeCustomerId) as Stripe.Customer;
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId,
          companyId
        }
      });
    }

    // Attach payment method
    await stripe.paymentMethods.attach(stripePaymentMethodId, {
      customer: customer.id
    });

    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: stripePaymentMethodId
      }
    });

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan.stripePriceId! }],
      metadata: {
        userId,
        companyId,
        planId
      }
    });

    // Cancel existing subscription
    if (existingSub) {
      this.db.prepare('UPDATE user_subscriptions SET status = ? WHERE id = ?')
        .run('canceled', existingSub.id);
    }

    // Create new subscription
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.db.prepare(`
      INSERT INTO user_subscriptions (
        id, user_id, company_id, plan_id, status,
        current_period_start, current_period_end,
        stripe_subscription_id, stripe_customer_id, cancel_at_period_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      subscriptionId,
      userId,
      companyId,
      planId,
      stripeSubscription.status === 'active' ? 'active' : 'trialing',
      new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      stripeSubscription.id,
      customer.id,
      0
    );

    return this.getUserSubscription(userId, companyId)!;
  }

  // Track usage
  async trackUsage(
    userId: string,
    companyId: string,
    metric: keyof Omit<UsageMetrics, 'userId' | 'companyId' | 'period'>
  ): Promise<void> {
    const period = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    const columnMap = {
      flowRuns: 'flow_runs',
      sandboxRuns: 'sandbox_runs',
      aiQueries: 'ai_queries',
      apiCalls: 'api_calls',
      storageGB: 'storage_gb'
    };

    const column = columnMap[metric];

    this.db.prepare(`
      INSERT INTO usage_metrics (user_id, company_id, period, ${column})
      VALUES (?, ?, ?, 1)
      ON CONFLICT(user_id, company_id, period)
      DO UPDATE SET ${column} = ${column} + 1, updated_at = CURRENT_TIMESTAMP
    `).run(userId, companyId, period);
  }

  // Check if user has exceeded quota
  async checkQuota(
    userId: string,
    companyId: string,
    metric: keyof Omit<UsageMetrics, 'userId' | 'companyId' | 'period'>
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    const subscription = this.getUserSubscription(userId, companyId);
    if (!subscription) {
      return { allowed: false, current: 0, limit: 0 };
    }

    const plan = this.getPlanById(subscription.planId);
    if (!plan) {
      return { allowed: false, current: 0, limit: 0 };
    }

    const limitMap = {
      flowRuns: 'maxRuns',
      sandboxRuns: 'maxSandboxRuns',
      aiQueries: 'maxAIQueries',
      apiCalls: 'maxAPICallsPerMinute'
    } as const;

    const limitKey = limitMap[metric as keyof typeof limitMap];
    const limit = plan.limits[limitKey];

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, current: 0, limit: -1 };
    }

    const period = new Date().toISOString().substring(0, 7);
    const usage = this.db.prepare(`
      SELECT ${this.camelToSnake(metric)} as current
      FROM usage_metrics
      WHERE user_id = ? AND company_id = ? AND period = ?
    `).get(userId, companyId, period) as any;

    const current = usage?.current || 0;
    
    return {
      allowed: current < limit,
      current,
      limit
    };
  }

  // Get current usage
  getCurrentUsage(userId: string, companyId: string): UsageMetrics {
    const period = new Date().toISOString().substring(0, 7);
    const usage = this.db.prepare(`
      SELECT * FROM usage_metrics
      WHERE user_id = ? AND company_id = ? AND period = ?
    `).get(userId, companyId, period) as any;

    if (!usage) {
      return {
        userId,
        companyId,
        period,
        flowRuns: 0,
        sandboxRuns: 0,
        aiQueries: 0,
        apiCalls: 0,
        storageGB: 0
      };
    }

    return {
      userId,
      companyId,
      period,
      flowRuns: usage.flow_runs || 0,
      sandboxRuns: usage.sandbox_runs || 0,
      aiQueries: usage.ai_queries || 0,
      apiCalls: usage.api_calls || 0,
      storageGB: usage.storage_gb || 0
    };
  }

  // Helper methods
  private mapRowToPlan(row: any): SubscriptionPlan {
    return {
      id: row.id,
      name: row.name,
      tier: row.tier,
      price: row.price,
      billingPeriod: row.billing_period,
      limits: {
        maxFlows: row.max_flows,
        maxRuns: row.max_runs,
        maxSandboxRuns: row.max_sandbox_runs,
        maxAIQueries: row.max_ai_queries,
        maxAPICallsPerMinute: row.max_api_calls_per_minute,
        maxTeamMembers: row.max_team_members,
        maxStorageGB: row.max_storage_gb
      },
      features: {
        customDomain: row.custom_domain === 1,
        whiteLabel: row.white_label === 1,
        prioritySupport: row.priority_support === 1,
        advancedAnalytics: row.advanced_analytics === 1,
        customIntegrations: row.custom_integrations === 1,
        ssoEnabled: row.sso_enabled === 1
      },
      stripeProductId: row.stripe_product_id,
      stripePriceId: row.stripe_price_id
    };
  }

  private mapRowToSubscription(row: any): UserSubscription {
    return {
      id: row.id,
      userId: row.user_id,
      companyId: row.company_id,
      planId: row.plan_id,
      status: row.status,
      currentPeriodStart: new Date(row.current_period_start),
      currentPeriodEnd: new Date(row.current_period_end),
      cancelAtPeriodEnd: row.cancel_at_period_end === 1,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripeCustomerId: row.stripe_customer_id
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
