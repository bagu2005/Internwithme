#!/bin/bash

# Stripe Keys Setup Script
echo "🔑 Setting up Stripe keys..."

# Backend .env file
BACKEND_ENV="/Users/bhargavramesh/Desktop/internwithme/server/.env"

# Add Stripe keys to backend .env
echo "" >> "$BACKEND_ENV"
echo "# Stripe Configuration" >> "$BACKEND_ENV"
echo "STRIPE_SECRET_KEY=sk_live_your_secret_key_here" >> "$BACKEND_ENV"
echo "STRIPE_PUBLISHABLE_KEY=pk_live_51NreyWGCnJtwt3fBrLCawt5uiNxrbROc2UTQlO3YF77tzV8oUoHnR1q1okt3FCkPCDnln1wFwLjkjf5RopmkXDop0060vTvqXg" >> "$BACKEND_ENV"
echo "STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here" >> "$BACKEND_ENV"

# Frontend .env file
FRONTEND_ENV="/Users/bhargavramesh/Desktop/internwithme/client/.env"

# Add Stripe publishable key to frontend .env
echo "" >> "$FRONTEND_ENV"
echo "# Stripe Configuration" >> "$FRONTEND_ENV"
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51NreyWGCnJtwt3fBrLCawt5uiNxrbROc2UTQlO3YF77tzV8oUoHnR1q1okt3FCkPCDnln1wFwLjkjf5RopmkXDop0060vTvqXg" >> "$FRONTEND_ENV"

echo "✅ Stripe keys added to environment files!"
echo ""
echo "⚠️  IMPORTANT: You still need to add your STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET"
echo "   Edit server/.env and replace 'sk_live_your_secret_key_here' with your actual secret key"
echo "   Edit server/.env and replace 'whsec_your_webhook_secret_here' with your webhook secret"
echo ""
echo "🔗 Get your keys from: https://dashboard.stripe.com/apikeys"
echo "🔗 Get webhook secret from: https://dashboard.stripe.com/webhooks"
