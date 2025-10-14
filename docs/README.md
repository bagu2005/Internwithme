# InternWithMe 🎓

A modern platform specifically designed for students and interns to discover internship opportunities and connect with companies. Built with a focus on user experience and student needs.

## ✨ Features

- 🏢 **Company Profiles**: Companies can create detailed profiles and post internship opportunities
- 📋 **Internship Listings**: Comprehensive job postings with requirements, duration, and compensation details
- 👤 **User Profiles**: Intern profiles with skills, interests, and experience
- 🔍 **Advanced Search & Filter**: Filter by location, company, duration, field, compensation, and more
- 📝 **Application System**: Easy apply functionality with resume upload
- ⭐ **Reviews & Ratings**: Interns can review companies and share experiences
- 💬 **Community Features**: Forums, tips, and success stories
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🔐 **Secure Authentication**: JWT-based authentication with role-based access

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Redis (caching)
- **Authentication**: JWT-based authentication
- **Deployment**: Docker + Docker Compose
- **UI Components**: Custom components with Lucide React icons

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd internwithme
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

### Option 2: Manual Setup

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**
   ```bash
   # Server environment
   cp server/env.example server/.env
   # Edit server/.env with your database credentials
   
   # Client environment
   cp client/env.example client/.env
   ```

3. **Start PostgreSQL and Redis**
   ```bash
   # Using Docker (recommended)
   docker-compose up postgres redis -d
   
   # Or install locally and start services
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## 🐳 Docker Deployment

### Development with Docker
```bash
docker-compose up
```

### Production Deployment
```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
internwithme/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Utility functions
│   └── package.json
├── shared/                # Shared types and utilities
│   └── types/            # TypeScript type definitions
├── docker-compose.yml     # Docker services configuration
├── setup.sh              # Automated setup script
└── README.md
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run install:all` - Install dependencies for all packages
- `npm run build` - Build the frontend for production

### Server
- `npm run server:dev` - Start backend server in development mode
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Client
- `npm run client:dev` - Start frontend in development mode
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Internships
- `GET /api/internships` - Get internships with filters
- `GET /api/internships/:id` - Get internship by ID
- `POST /api/internships` - Create internship (company only)
- `PUT /api/internships/:id` - Update internship (company only)
- `DELETE /api/internships/:id` - Delete internship (company only)

### Applications
- `POST /api/applications` - Apply to internship (intern only)
- `GET /api/applications` - Get applications
- `GET /api/applications/my-applications` - Get my applications (intern)
- `GET /api/applications/company-applications` - Get company applications
- `PUT /api/applications/:id/status` - Update application status (company)

### Reviews
- `POST /api/reviews` - Create review (intern only)
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/company/:companyId` - Get company reviews
- `PUT /api/reviews/:id` - Update review (author only)
- `DELETE /api/reviews/:id` - Delete review (author only)

## 🔐 Environment Variables

### Server (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/internwithme
DB_HOST=localhost
DB_PORT=5432
DB_NAME=internwithme
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=InternWithMe
```

## 🎯 Key Features Implementation

### User Roles
- **Intern**: Can browse internships, apply, write reviews
- **Company**: Can post internships, manage applications, view analytics
- **Admin**: Full system access

### Search & Filtering
- Text search across title, description, company, skills
- Filter by location, category, duration, compensation
- Sort by date, relevance, compensation
- Pagination for large result sets

### Application System
- One-click application with resume upload
- Application status tracking
- Company can review and update status
- Email notifications (planned)

## 🚀 Deployment

### Production Checklist
1. Set up PostgreSQL database
2. Configure environment variables
3. Set up Redis for caching
4. Configure reverse proxy (Nginx)
5. Set up SSL certificates
6. Configure monitoring and logging

### Environment Setup
- **Development**: Local PostgreSQL + Redis
- **Staging**: Docker containers
- **Production**: Managed database services (AWS RDS, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for students and interns
- Inspired by the need for better internship discovery platforms
- Thanks to the open-source community for amazing tools and libraries

## 📞 Support

- Create an issue for bug reports
- Start a discussion for feature requests
- Check the documentation for common questions

---

**Happy interning! 🎓✨**
