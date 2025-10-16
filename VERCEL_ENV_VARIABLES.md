# 🔧 Vercel Environment Variables Setup

## Copy these to your Vercel project environment variables:

### Frontend Variables:
```bash
VITE_API_URL=https://internwithme-production.up.railway.app/api
VITE_GOOGLE_CLIENT_ID=89067507887-db174hug6dhocq6109ra6el9klgpocgf.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51SIRkE5Dx64lk8lngh2tqC699BWoPhVq4eWGxx0fR5l4jsTvpwyjI1S2KjPeA12NWEN3WAIen1fjwQVfEWF23NCE00lHgrm114
VITE_APP_NAME=InternWithMe
VITE_APP_VERSION=1.0.0
```

### Backend Variables (if deploying backend):
```bash
DATABASE_URL=postgresql://postgres:hTmoAExwFIZWLpOpNeUvIeiNPMyyaHEN@turntable.proxy.rlwy.net:31859/railway
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=internwithme
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=ee1674f96a177fd37bcbd93cb47c395911c930a4740064cf995520d463f33c32
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=89067507887-db174hug6dhocq6109ra6el9klgpocgf.apps.googleusercontent.com
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_51SIRkE5Dx64lk8lngh2tqC699BWoPhVq4eWGxx0fR5l4jsTvpwyjI1S2KjPeA12NWEN3WAIen1fjwQVfEWF23NCE00lHgrm114
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://internwithme-hedryp0ey-bagu2005s-projects.vercel.app
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🎯 Quick Setup Instructions:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add each variable** with Production environment selected
3. **Redeploy** your project after adding variables

## 🔑 Where to Get Values:

- **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com)
- **Stripe Keys**: [Stripe Dashboard](https://dashboard.stripe.com)
- **Database**: Vercel Postgres, Supabase, or Railway
- **JWT Secret**: Generate a random 32+ character string
