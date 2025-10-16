import axios from 'axios';
import { pool } from '../config/database';

interface JobPosting {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary?: string;
  type: 'internship' | 'full-time' | 'part-time';
  remote: boolean;
  source: string;
  sourceUrl: string;
  postedDate: Date;
  applicationDeadline?: Date;
}

export class JobScrapingService {
  private static instance: JobScrapingService;
  
  public static getInstance(): JobScrapingService {
    if (!JobScrapingService.instance) {
      JobScrapingService.instance = new JobScrapingService();
    }
    return JobScrapingService.instance;
  }

  // Scrape jobs from multiple sources
  async scrapeAllJobs(): Promise<void> {
    console.log('🔄 Starting job scraping...');
    
    try {
      const jobs = await Promise.all([
        this.scrapeIndeedJobs(),
        this.scrapeLinkedInJobs(),
        this.scrapeGlassdoorJobs(),
        this.scrapeAngelListJobs()
      ]);

      const allJobs = jobs.flat();
      console.log(`📊 Found ${allJobs.length} total jobs`);

      // Store jobs in database
      await this.storeJobs(allJobs);
      
      console.log('✅ Job scraping completed successfully');
    } catch (error) {
      console.error('❌ Job scraping failed:', error);
    }
  }

  // Scrape from Indeed (simplified example)
  private async scrapeIndeedJobs(): Promise<JobPosting[]> {
    console.log('🔍 Scraping Indeed...');
    
    // This is a simplified example - in production you'd use proper scraping
    const mockJobs: JobPosting[] = [
      {
        title: 'Software Engineering Intern',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        description: 'Join our engineering team for a summer internship...',
        requirements: ['Computer Science student', 'Python/JavaScript experience'],
        benefits: ['Mentorship', 'Free lunch', 'Flexible hours'],
        salary: '$25-30/hour',
        type: 'internship',
        remote: false,
        source: 'Indeed',
        sourceUrl: 'https://indeed.com/viewjob?jk=123',
        postedDate: new Date(),
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        title: 'Marketing Intern',
        company: 'StartupXYZ',
        location: 'Remote',
        description: 'Help us grow our brand and reach new customers...',
        requirements: ['Marketing or Business student', 'Social media experience'],
        benefits: ['Remote work', 'Learning opportunities'],
        salary: '$20-25/hour',
        type: 'internship',
        remote: true,
        source: 'Indeed',
        sourceUrl: 'https://indeed.com/viewjob?jk=124',
        postedDate: new Date(),
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      }
    ];

    return mockJobs;
  }

  // Scrape from LinkedIn (simplified example)
  private async scrapeLinkedInJobs(): Promise<JobPosting[]> {
    console.log('🔍 Scraping LinkedIn...');
    
    const mockJobs: JobPosting[] = [
      {
        title: 'Data Science Intern',
        company: 'DataCorp',
        location: 'New York, NY',
        description: 'Work with our data team to analyze user behavior...',
        requirements: ['Statistics/Data Science student', 'Python/R experience'],
        benefits: ['Real-world projects', 'Data science mentorship'],
        salary: '$28-35/hour',
        type: 'internship',
        remote: false,
        source: 'LinkedIn',
        sourceUrl: 'https://linkedin.com/jobs/view/123',
        postedDate: new Date(),
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      }
    ];

    return mockJobs;
  }

  // Scrape from Glassdoor (simplified example)
  private async scrapeGlassdoorJobs(): Promise<JobPosting[]> {
    console.log('🔍 Scraping Glassdoor...');
    
    const mockJobs: JobPosting[] = [
      {
        title: 'Product Management Intern',
        company: 'ProductCo',
        location: 'Seattle, WA',
        description: 'Help shape the future of our products...',
        requirements: ['Business/Engineering student', 'Analytical thinking'],
        benefits: ['Product mentorship', 'Cross-functional exposure'],
        salary: '$22-28/hour',
        type: 'internship',
        remote: false,
        source: 'Glassdoor',
        sourceUrl: 'https://glassdoor.com/job-listing/123',
        postedDate: new Date(),
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      }
    ];

    return mockJobs;
  }

  // Scrape from AngelList (simplified example)
  private async scrapeAngelListJobs(): Promise<JobPosting[]> {
    console.log('🔍 Scraping AngelList...');
    
    const mockJobs: JobPosting[] = [
      {
        title: 'Frontend Developer Intern',
        company: 'StartupABC',
        location: 'Remote',
        description: 'Build beautiful user interfaces for our platform...',
        requirements: ['React/Vue experience', 'CSS/HTML skills'],
        benefits: ['Startup experience', 'Equity potential'],
        salary: '$18-25/hour',
        type: 'internship',
        remote: true,
        source: 'AngelList',
        sourceUrl: 'https://angel.co/company/startupabc/jobs/123',
        postedDate: new Date(),
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      }
    ];

    return mockJobs;
  }

  // Store jobs in database
  private async storeJobs(jobs: JobPosting[]): Promise<void> {
    const client = await pool.connect();
    
    try {
      for (const job of jobs) {
        // Check if job already exists
        const existingJob = await client.query(
          'SELECT id FROM job_postings WHERE source_url = $1',
          [job.sourceUrl]
        );

        if (existingJob.rows.length > 0) {
          console.log(`⏭️  Job already exists: ${job.title} at ${job.company}`);
          continue;
        }

        // Insert new job
        await client.query(`
          INSERT INTO job_postings (
            title, company, location, description, requirements, benefits,
            salary, type, remote, source, source_url, posted_date, application_deadline
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          job.title,
          job.company,
          job.location,
          job.description,
          job.requirements,
          job.benefits,
          job.salary,
          job.type,
          job.remote,
          job.source,
          job.sourceUrl,
          job.postedDate,
          job.applicationDeadline
        ]);

        console.log(`✅ Stored job: ${job.title} at ${job.company}`);
      }
    } finally {
      client.release();
    }
  }

  // Get jobs for user matching
  async getJobsForMatching(userId: string): Promise<JobPosting[]> {
    const client = await pool.connect();
    
    try {
      // Get user profile for matching
      const userProfile = await client.query(`
        SELECT skills, interests, location, university, major
        FROM intern_profiles ip
        JOIN users u ON ip.user_id = u.id
        WHERE u.id = $1
      `, [userId]);

      if (userProfile.rows.length === 0) {
        return [];
      }

      const profile = userProfile.rows[0];
      
      // Simple matching algorithm (can be improved with ML)
      const jobs = await client.query(`
        SELECT * FROM job_postings 
        WHERE application_deadline > NOW()
        ORDER BY posted_date DESC
        LIMIT 50
      `);

      return jobs.rows;
    } finally {
      client.release();
    }
  }
}

export const jobScrapingService = JobScrapingService.getInstance();
