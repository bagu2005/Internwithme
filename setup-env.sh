#!/bin/bash

echo "🔧 Setting up environment variables for InternWithMe..."

# Create .env file in server directory
cat > server/.env << 'EOF'
# Database Configuration (Railway)
DB_HOST=roundhouse.proxy.rlwy.net
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your_railway_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Email Configuration (for OTP and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=89067507887-db174hug6dhocq6109ra6el9klgpocgf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF

echo "✅ Created server/.env file"
echo ""
echo "⚠️  IMPORTANT: You need to update the following values in server/.env:"
echo "   1. DB_PASSWORD - Your Railway database password"
echo "   2. JWT_SECRET - A random secret string"
echo "   3. EMAIL_USER & EMAIL_PASS - Your Gmail credentials"
echo "   4. GOOGLE_CLIENT_SECRET - Your Google OAuth secret"
echo "   5. STRIPE_SECRET_KEY & STRIPE_PUBLISHABLE_KEY - Your Stripe keys"
echo ""
echo "📝 To get your Railway database password:"
echo "   1. Go to your Railway dashboard"
echo "   2. Click on your database service"
echo "   3. Go to the 'Variables' tab"
echo "   4. Copy the PGPASSWORD value"
echo ""
echo "🚀 After updating the .env file, run:"
echo "   cd server && npm run dev"
