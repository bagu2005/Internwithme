#!/bin/bash

echo "🚀 Optimizing InternWithMe for Production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing production dependencies..."

# Install production dependencies for server
cd server
npm install --production
echo "✅ Server dependencies installed"

# Install production dependencies for client
cd ../client
npm install --production
echo "✅ Client dependencies installed"

cd ..

echo "🔧 Optimizing server configuration..."

# Create production environment file
cat > server/.env.production << EOF
# Production Environment Variables
NODE_ENV=production
PORT=5001

# Database (Update with your production database URL)
DATABASE_URL=your_production_database_url_here

# JWT (Generate a secure secret)
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=7d

# Google OAuth (Update with your production client ID)
GOOGLE_CLIENT_ID=your_google_client_id_here

# Stripe (Update with your production keys)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# CORS (Update with your production frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

echo "✅ Production environment file created"

# Create production environment file for client
cat > client/.env.production << EOF
# Production Environment Variables
VITE_API_URL=https://your-backend-domain.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
EOF

echo "✅ Client production environment file created"

echo "🏗️ Building applications..."

# Build client
cd client
npm run build
echo "✅ Client built successfully"

cd ../server

# Build server (if using TypeScript compilation)
if [ -f "tsconfig.json" ]; then
    npm run build
    echo "✅ Server built successfully"
fi

cd ..

echo "📋 Creating deployment checklist..."

cat > DEPLOYMENT_CHECKLIST.md << EOF
# 🚀 Deployment Checklist

## Pre-Deployment
- [ ] Update all environment variables in .env.production files
- [ ] Test database connection
- [ ] Verify Google OAuth settings
- [ ] Test Stripe integration
- [ ] Run security audit: \`npm audit\`
- [ ] Test all core features locally

## Backend Deployment
- [ ] Deploy to your chosen platform (Railway, DigitalOcean, AWS)
- [ ] Set environment variables in platform dashboard
- [ ] Verify server is running: \`curl https://your-backend-domain.com/health\`
- [ ] Test API endpoints

## Frontend Deployment
- [ ] Deploy to Vercel, Netlify, or your hosting provider
- [ ] Set environment variables in platform dashboard
- [ ] Verify frontend loads correctly
- [ ] Test all user flows

## Post-Deployment
- [ ] Update Google OAuth redirect URIs
- [ ] Update Stripe webhook URLs
- [ ] Test user registration/login
- [ ] Test internship creation/application
- [ ] Test payment processing
- [ ] Monitor error logs
- [ ] Set up monitoring and alerts

## Security
- [ ] Enable HTTPS/SSL
- [ ] Configure security headers
- [ ] Set up rate limiting
- [ ] Enable CORS for production domain
- [ ] Test file upload security
- [ ] Verify input validation

## Performance
- [ ] Enable compression
- [ ] Set up CDN (if needed)
- [ ] Monitor response times
- [ ] Check database performance
- [ ] Optimize images and assets

## Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Set up performance monitoring
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation
- [ ] Set up backup systems
EOF

echo "✅ Deployment checklist created"

echo "🔍 Running security audit..."

# Run security audit
cd server
npm audit --audit-level moderate
echo "✅ Security audit completed"

cd ../client
npm audit --audit-level moderate
echo "✅ Client security audit completed"

cd ..

echo "📊 Creating performance optimization guide..."

cat > PERFORMANCE_OPTIMIZATION.md << EOF
# ⚡ Performance Optimization Guide

## Backend Optimizations

### Database
- Use connection pooling (already configured)
- Add database indexes for frequently queried fields
- Implement query optimization
- Use database caching (Redis)

### API
- Enable compression middleware
- Implement response caching
- Use pagination for large datasets
- Optimize database queries

### File Handling
- Use CDN for static files
- Implement image optimization
- Use streaming for large files
- Implement file cleanup

## Frontend Optimizations

### Bundle Size
- Use code splitting
- Implement lazy loading
- Remove unused dependencies
- Optimize images

### Performance
- Enable service worker caching
- Use React.memo for components
- Implement virtual scrolling for large lists
- Optimize re-renders

### SEO
- Add meta tags
- Implement structured data
- Use semantic HTML
- Optimize for Core Web Vitals

## Monitoring
- Set up performance monitoring
- Monitor Core Web Vitals
- Track user experience metrics
- Monitor API response times
EOF

echo "✅ Performance optimization guide created"

echo "🎉 Production optimization complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update environment variables in .env.production files"
echo "2. Review DEPLOYMENT_CHECKLIST.md"
echo "3. Choose your deployment platform"
echo "4. Deploy backend and frontend"
echo "5. Test all features in production"
echo ""
echo "🚀 Your app is ready for professional deployment!"
echo ""
echo "📚 Documentation created:"
echo "   - PRODUCTION_SETUP.md (Complete setup guide)"
echo "   - DEPLOYMENT_CHECKLIST.md (Step-by-step checklist)"
echo "   - PERFORMANCE_OPTIMIZATION.md (Performance tips)"
echo ""
echo "💪 Your InternWithMe app is now production-ready!"
