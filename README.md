# 🚀 InternWithMe

A comprehensive full-stack internship platform connecting students with companies for meaningful internship opportunities.

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **Google OAuth integration** for seamless sign-in
- **OTP email verification** for account security
- **Password reset** functionality
- **Role-based access control** (Interns, Companies, Admins)

### 👥 User Management
- **Dual user types**: Interns and Companies
- **Comprehensive profiles** with skills, experience, and portfolio links
- **Identity verification** system with document uploads
- **Profile customization** with avatars and detailed information

### 💼 Internship Management
- **Company dashboard** for posting and managing internships
- **Advanced search and filtering** for internship opportunities
- **Application tracking** system
- **Review and rating** system for companies and internships

### 💳 Subscription System
- **Three-tier plans**: Free, Premium, Pro
- **Stripe integration** for secure payments
- **Application limits** based on subscription tier
- **Subscription management** portal

### 📱 Multi-Platform Support
- **Web application** (React + TypeScript)
- **Mobile app** (React Native + Expo)
- **Responsive design** with Tailwind CSS

### 🛠️ Additional Features
- **Contact us page** with form submission
- **File upload** system for resumes and documents
- **Email notifications** for important events
- **Admin verification** dashboard

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form management

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **JWT** for authentication
- **Stripe** for payments
- **Nodemailer** for emails

### Mobile
- **React Native** with Expo
- **React Navigation** for mobile navigation
- **Async Storage** for local data

### Infrastructure
- **Docker** containerization
- **Railway** for database hosting
- **Cloud storage** for file uploads

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bhargavramesh/internwithme.git
   cd internwithme
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   
   # Install mobile dependencies (optional)
   cd ../mobile && npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/env.example server/.env
   cp client/env.example client/.env
   
   # Configure your environment variables
   # See docs/SETUP.md for detailed instructions
   ```

4. **Database Setup**
   ```bash
   # The database will be automatically initialized when you start the server
   # Make sure your PostgreSQL connection is configured in server/.env
   ```

5. **Start the application**
   ```bash
   # Start the backend server
   cd server && npm run dev
   
   # Start the frontend (in a new terminal)
   cd client && npm run dev
   
   # Start the mobile app (optional)
   cd mobile && npm start
   ```

## 📁 Project Structure

```
internwithme/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── contexts/      # React contexts
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── config/        # Configuration files
│   └── uploads/           # File uploads
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── screens/       # Mobile screens
│   │   ├── components/    # Mobile components
│   │   └── services/      # Mobile API services
├── shared/                # Shared TypeScript types
├── docs/                  # Documentation
└── docker-compose.yml     # Docker configuration
```

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```env
# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=internwithme
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT
JWT_SECRET=your-jwt-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

#### Client (.env)
```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## 📚 Documentation

- [Setup Guide](docs/SETUP.md)
- [Production Setup](docs/PRODUCTION_SETUP.md)
- [Mobile App Setup](docs/MOBILE_APP_SETUP.md)
- [Stripe Integration](docs/STRIPE_SETUP.md)
- [Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)

## 🚀 Deployment

### Production Setup
1. Set up a PostgreSQL database (Railway, Supabase, or Neon)
2. Configure environment variables for production
3. Deploy backend to a cloud service (Railway, Heroku, or Vercel)
4. Deploy frontend to Vercel or Netlify
5. Configure domain and SSL certificates

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Bhargav Ramesh**
- GitHub: [@bhargavramesh](https://github.com/bhargavramesh)

## 🙏 Acknowledgments

- React and TypeScript communities
- Tailwind CSS for the amazing styling framework
- Stripe for payment processing
- Railway for database hosting
- All the open-source libraries that made this project possible

---

**Built with ❤️ for the internship community**# Deployment Update Thu Oct 16 20:27:34 +08 2025
