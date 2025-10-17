const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Import services
const JobScrapingService = require('./services/JobScrapingService');
const SupabaseService = require('./services/SupabaseService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3003",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3003",
  credentials: true
}));
app.use(express.json());

// Initialize services
const jobScrapingService = new JobScrapingService();
const supabaseService = new SupabaseService();

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle job requests
  socket.on('request_jobs', async (userPreferences) => {
    try {
      console.log('Job request received:', userPreferences);
      
      // Get existing jobs from database
      let jobs = await supabaseService.getJobs();
      
      // If we have less than 10 jobs, trigger scraping
      if (jobs.length < 10) {
        socket.emit('scraping_status', { status: 'scraping', message: 'Finding fresh jobs...' });
        
        const newJobs = await jobScrapingService.scrapeAllJobs(userPreferences);
        
        if (newJobs.length > 0) {
          await supabaseService.addJobs(newJobs);
          jobs = await supabaseService.getJobs();
          socket.emit('scraping_status', { status: 'completed', message: `Found ${newJobs.length} new jobs!` });
        }
      }
      
      // Send jobs to client
      socket.emit('jobs_update', jobs);
      
    } catch (error) {
      console.error('Error handling job request:', error);
      socket.emit('error', { message: 'Failed to fetch jobs' });
    }
  });

  // Handle real-time job filtering
  socket.on('filter_jobs', async (filters) => {
    try {
      const jobs = await supabaseService.getJobs(filters);
      socket.emit('jobs_update', jobs);
    } catch (error) {
      console.error('Error filtering jobs:', error);
      socket.emit('error', { message: 'Failed to filter jobs' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Job scraping backend is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await supabaseService.getJobs();
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/stats', async (req, res) => {
  try {
    const jobs = await supabaseService.getJobs();
    const stats = {
      totalJobs: jobs.length,
      singaporeJobs: jobs.filter(job => job.location === 'Singapore').length,
      remoteJobs: jobs.filter(job => job.remote === true).length,
      techJobs: jobs.filter(job => 
        job.title.toLowerCase().includes('software') || 
        job.title.toLowerCase().includes('developer') ||
        job.title.toLowerCase().includes('engineer') ||
        job.title.toLowerCase().includes('data') ||
        job.title.toLowerCase().includes('ai') ||
        job.title.toLowerCase().includes('ml')
      ).length,
      averageSalary: jobs.filter(job => job.salary).length > 0 
        ? Math.round(jobs.filter(job => job.salary).reduce((sum, job) => {
            const salary = job.salary.replace(/[^\d]/g, '');
            return sum + parseInt(salary);
          }, 0) / jobs.filter(job => job.salary).length)
        : 0
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch job stats' });
  }
});

app.get('/api/jobs/recommendations', async (req, res) => {
  try {
    const jobs = await supabaseService.getJobs();
    // Return top 10 jobs as recommendations
    const recommendations = jobs.slice(0, 10);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Error fetching job recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch job recommendations' });
  }
});

app.post('/api/jobs/scrape', async (req, res) => {
  try {
    const { userPreferences } = req.body;
    const newJobs = await jobScrapingService.scrapeAllJobs(userPreferences);
    
    if (newJobs.length > 0) {
      await supabaseService.addJobs(newJobs);
    }
    
    res.json({ 
      success: true, 
      message: `Scraped ${newJobs.length} new jobs`,
      data: newJobs 
    });
  } catch (error) {
    console.error('Error scraping jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to scrape jobs' });
  }
});

// Clear all jobs from database
app.delete('/api/jobs/clear', async (req, res) => {
  try {
    await supabaseService.clearJobs();
    res.json({ success: true, message: 'All jobs cleared from database' });
  } catch (error) {
    console.error('Error clearing jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// MASSIVE real-time job scraping (every 30 seconds)
cron.schedule('*/30 * * * * *', async () => {
  console.log('🚀 Running MASSIVE real-time job scraping...');
  try {
    const newJobs = await jobScrapingService.scrapeAllJobs();
    if (newJobs.length > 0) {
      await supabaseService.addJobs(newJobs);
      console.log(`✅ Added ${newJobs.length} new jobs to database`);
      
      // Notify connected clients with full job data
      io.emit('new_jobs', { count: newJobs.length, jobs: newJobs });
    }
  } catch (error) {
    console.error('❌ Scheduled scraping failed:', error);
  }
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, async () => {
  console.log(`🚀 Job scraping backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  
  // Initial job scraping to populate database immediately
  console.log('🎯 Running initial job scraping to populate database...');
  try {
    const initialJobs = await jobScrapingService.scrapeAllJobs();
    if (initialJobs.length > 0) {
      await supabaseService.addJobs(initialJobs);
      console.log(`✅ Initial scraping complete: ${initialJobs.length} jobs added to database`);
    }
  } catch (error) {
    console.error('❌ Initial scraping failed:', error);
  }
});
