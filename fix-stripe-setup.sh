#!/bin/bash

echo "🔧 Fixing Stripe setup..."

# Backend .env file
BACKEND_ENV="/Users/bhargavramesh/Desktop/internwithme/server/.env"

# Remove existing Stripe lines and add correct ones
sed -i '' '/STRIPE_/d' "$BACKEND_ENV"

echo "" >> "$BACKEND_ENV"
echo "# Stripe Configuration" >> "$BACKEND_ENV"
echo "STRIPE_SECRET_KEY=sk_live_REPLACE_WITH_YOUR_ACTUAL_SECRET_KEY" >> "$BACKEND_ENV"
echo "STRIPE_PUBLISHABLE_KEY=pk_live_51NreyWGCnJtwt3fBrLCawt5uiNxrbROc2UTQlO3YF77tzV8oUoHnR1q1okt3FCkPCDnln1wFwLjkjf5RopmkXDop0060vTvqXg" >> "$BACKEND_ENV"
echo "STRIPE_WEBHOOK_SECRET=whsec_REPLACE_WITH_YOUR_WEBHOOK_SECRET" >> "$BACKEND_ENV"

# Frontend .env file
FRONTEND_ENV="/Users/bhargavramesh/Desktop/internwithme/client/.env"

# Remove existing Stripe lines and add correct ones
sed -i '' '/STRIPE_/d' "$FRONTEND_ENV"

echo "" >> "$FRONTEND_ENV"
echo "# Stripe Configuration" >> "$FRONTEND_ENV"
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51NreyWGCnJtwt3fBrLCawt5uiNxrbROc2UTQlO3YF77tzV8oUoHnR1q1okt3FCkPCDnln1wFwLjkjf5RopmkXDop0060vTvqXg" >> "$FRONTEND_ENV"

echo "✅ Stripe configuration updated!"
echo ""
echo "⚠️  IMPORTANT: You need to replace the placeholder values:"
echo "   1. Edit server/.env"
echo "   2. Replace 'sk_live_REPLACE_WITH_YOUR_ACTUAL_SECRET_KEY' with your actual secret key"
echo "   3. Replace 'whsec_REPLACE_WITH_YOUR_WEBHOOK_SECRET' with your webhook secret"
echo ""
echo "🔗 Get your keys from: https://dashboard.stripe.com/apikeys"
echo "🔗 Get webhook secret from: https://dashboard.stripe.com/webhooks"
