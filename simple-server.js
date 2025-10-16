const express = require('./server/node_modules/express');
const cors = require('./server/node_modules/cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Simple server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint with sample data
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

// Test login endpoint (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock login - accept any credentials for testing
  if (email && password) {
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          firstName: 'Test',
          lastName: 'User',
          email: email,
          role: 'intern',
          isVerified: true
        },
        token: 'mock-jwt-token-for-testing'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
});

// Test register endpoint (mock)
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  // Mock registration - accept any data for testing
  if (firstName && lastName && email && password) {
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: '1',
          firstName,
          lastName,
          email,
          role: 'intern',
          isVerified: false
        }
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
