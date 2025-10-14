import express from 'express';
import { getSubscriptionPlans, getCurrentSubscription, createSubscription, cancelSubscription } from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/plans', getSubscriptionPlans);

// Protected routes
router.use(authenticate);
router.get('/current', getCurrentSubscription);
router.post('/create', createSubscription);
router.post('/cancel', cancelSubscription);

export default router;
