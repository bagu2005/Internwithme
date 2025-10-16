import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import reviewRoutes from './routes/reviews';
import verificationRoutes from './routes/verification';
import uploadRoutes from './routes/upload';
import googleAuthRoutes from './routes/googleAuth';
import subscriptionRoutes from './routes/subscriptions';
import stripeRoutes from './routes/stripe';
import contactRoutes from './routes/contact';
import { connectDatabase } from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'InternWithMe API is running!',
    timestamp: new Date().toISOString(),
  });
});

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
// Health check endpoint (simple version)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint with sample data (no database required)
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'Test endpoint working',
    sampleJobs: [
      {
        id: '1',
        title: 'Software Engineering Intern',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        description: 'Join our engineering team for a summer internship...',
        requirements: ['Computer Science student', 'Python/JavaScript experience'],
        benefits: ['Mentorship', 'Free lunch', 'Flexible hours'],
        salary: '$25-30/hour',
        type: 'internship',
        remote: false,
        source: 'Indeed',
        sourceUrl: 'https://indeed.com/viewjob?jk=123',
        postedDate: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'Marketing Intern',
        company: 'StartupXYZ',
        location: 'Remote',
        description: 'Help us grow our brand and reach new customers...',
        requirements: ['Marketing or Business student', 'Social media experience'],
        benefits: ['Remote work', 'Learning opportunities'],
        salary: '$20-25/hour',
        type: 'internship',
        remote: true,
        source: 'LinkedIn',
        sourceUrl: 'https://linkedin.com/jobs/view/124',
        postedDate: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/contact', contactRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Start server immediately without waiting for database
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend: http://localhost:3001`);
    });

    // Try to connect to database in background (non-blocking)
    setTimeout(async () => {
      try {
        await connectDatabase();
        console.log('✅ Database connected');
      } catch (dbError) {
        console.log('⚠️  Database not available - running in demo mode');
        console.log('   To enable full functionality, start PostgreSQL');
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
