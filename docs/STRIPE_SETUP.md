# 💳 Stripe Payment Integration Setup

## 🔑 Required Stripe Keys

Add these environment variables to your `server/.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_51NreyWGCnJtwt3fBrLCawt5uiNxrbROc2UTQlO3YF77tzV8oUoHnR1q1okt3FCkPCDnln1wFwLjkjf5RopmkXDop0060vTvqXg
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 📋 How to Get Stripe Keys

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete account verification

### 2. Get API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click on "Developers" → "API keys"
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Copy your **Secret key** (starts with `sk_live_`)

### 3. Set Up Webhook
1. Go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Set URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

## 💰 Subscription Plans

### Free Plan
- **Price**: $0/month
- **Applications**: 3 per month
- **Features**: Basic profile, search, notifications

### Premium Plan
- **Price**: $9.99/month
- **Applications**: 15 per month
- **Features**: AI cover letters (10/month), resume optimization (5/month), job matching

### Pro Plan
- **Price**: $19.99/month
- **Applications**: Unlimited
- **Features**: All AI features unlimited, company insights, priority support

## 🚀 Testing

### Test Cards (Stripe Live Mode)
⚠️ **WARNING**: You're using LIVE mode! Real payments will be processed.
- **Success**: `4242 4242 4240 0000`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

### Test Flow
1. User selects a paid plan
2. Redirected to Stripe Checkout
3. Enters test card details
4. Payment processed
5. Webhook updates subscription status
6. User gains access to premium features

## 🔧 Implementation Status

✅ **Backend**: Stripe service, controllers, routes  
✅ **Database**: Subscription tables with limits  
✅ **Application Limits**: 3 (Free), 15 (Premium), Unlimited (Pro)  
✅ **Webhook Handling**: Payment events processed  
⏳ **Frontend**: Payment UI components (next step)  

## 📝 Next Steps

1. **Add your Stripe keys** to `server/.env`
2. **Test payment flow** with test cards
3. **Set up webhook endpoint** for production
4. **Deploy and test** with real payments

## 🛡️ Security Notes

- Never commit real Stripe keys to version control
- Use environment variables for all sensitive data
- Test thoroughly in Stripe test mode before going live
- Monitor webhook events in Stripe dashboard
