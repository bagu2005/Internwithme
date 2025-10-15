# 🔧 Complete Environment Variables Setup

## 🎯 Frontend Variables (for Vercel)

### Required for Production:
```bash
VITE_API_URL=https://your-backend-url.vercel.app/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### Optional but Recommended:
```bash
VITE_APP_NAME=InternWithMe
VITE_APP_VERSION=1.0.0
```

## 🎯 Backend Variables (for Vercel)

### Database:
```bash
DATABASE_URL=postgresql://username:password@host:port/database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=internwithme
DB_USER=your_username
DB_PASSWORD=your_password
```

### Authentication:
```bash
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d
```

### OAuth & Payments:
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Server Configuration:
```bash
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment Steps

### 1. Frontend Deployment:
1. Go to [vercel.com](https://vercel.com)
2. Import repository: `https://github.com/bagu2005/Internwithme`
3. Set **Root Directory** to `client`
4. Add frontend environment variables
5. Deploy!

### 2. Backend Deployment:
1. Create new Vercel project
2. Set **Root Directory** to `server`
3. Add backend environment variables
4. Deploy!

## 🔑 Where to Get These Values:

### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins

### Stripe:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get API keys from **Developers** → **API keys**
3. Create webhook endpoint for payments

### Database:
1. Use Vercel Postgres, Supabase, or Railway
2. Get connection string from your database provider

## ⚠️ Important Notes:

- **JWT_SECRET**: Must be at least 32 characters long
- **CORS_ORIGIN**: Must match your frontend URL exactly
- **Database**: Use production database, not localhost
- **Stripe**: Use test keys for development, live keys for production
- **Google OAuth**: Add your production domains to authorized origins

## 🧪 Testing:

After deployment, test these features:
- ✅ User registration/login
- ✅ Google OAuth sign-in
- ✅ Stripe payment processing
- ✅ File uploads
- ✅ API connectivity
