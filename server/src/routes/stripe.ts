import express from 'express';
import { createCheckoutSession, createPortalSession, handleWebhook, cancelSubscription } from '../controllers/stripeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Webhook endpoint (no authentication required)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(authenticate);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-portal-session', createPortalSession);
router.post('/cancel-subscription', cancelSubscription);

export default router;
