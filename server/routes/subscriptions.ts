import { Router, Request, Response } from 'express';
import { authenticateToken } from '../auth';
import { SubscriptionService } from '../services/subscription-service';
import { db } from '../database';

const router = Router();
const subscriptionService = new SubscriptionService(db);

// Get all available plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = subscriptionService.getAllPlans();
    res.json({ success: true, plans });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Get plans error:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Get current user subscription
router.get('/subscription', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user.id || user.userId;
    const companyId = user.company_id || user.companyId;
    
    let subscription = subscriptionService.getUserSubscription(userId, companyId);
    
    if (!subscription) {
      subscription = await subscriptionService.createFreeSubscription(userId, companyId);
    }

    const plan = subscriptionService.getPlanById(subscription.planId);
    const usage = subscriptionService.getCurrentUsage(userId, companyId);

    res.json({
      success: true,
      subscription: {
        ...subscription,
        plan,
        usage
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Get subscription error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Alias endpoint for /current
router.get('/current', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user.id || user.userId;
    const companyId = user.company_id || user.companyId;
    
    let subscription = subscriptionService.getUserSubscription(userId, companyId);
    
    if (!subscription) {
      subscription = await subscriptionService.createFreeSubscription(userId, companyId);
    }

    const plan = subscriptionService.getPlanById(subscription.planId);
    const usage = subscriptionService.getCurrentUsage(userId, companyId);

    res.json({
      success: true,
      subscription: {
        ...subscription,
        plan,
        usage
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Get current subscription error:', err);
    res.status(500).json({ error: 'Failed to fetch current subscription' });
  }
});

export default router;
