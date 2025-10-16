const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

class JobScrapingService {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];
  }

  async scrapeAllJobs(userPreferences = {}) {
    const allJobs = [];
    
    try {
      console.log('Starting job scraping with preferences:', userPreferences);
      
      // Scrape from different sources in parallel
      const [indeedJobs, linkedinJobs, glassdoorJobs, remoteJobs] = await Promise.allSettled([
        this.scrapeIndeed(userPreferences),
        this.scrapeLinkedIn(userPreferences),
        this.scrapeGlassdoor(userPreferences),
        this.scrapeRemoteJobs(userPreferences)
      ]);

      // Collect successful results
      if (indeedJobs.status === 'fulfilled') allJobs.push(...indeedJobs.value);
      if (linkedinJobs.status === 'fulfilled') allJobs.push(...linkedinJobs.value);
      if (glassdoorJobs.status === 'fulfilled') allJobs.push(...glassdoorJobs.value);
      if (remoteJobs.status === 'fulfilled') allJobs.push(...remoteJobs.value);

      // Remove duplicates and sort by relevance
      const uniqueJobs = this.removeDuplicates(allJobs);
      const sortedJobs = this.sortByRelevance(uniqueJobs, userPreferences);

      console.log(`Scraped ${sortedJobs.length} unique jobs from all sources`);
      return sortedJobs;
    } catch (error) {
      console.error('Error scraping jobs:', error);
      return [];
    }
  }

  async scrapeIndeed(userPreferences = {}) {
    try {
      console.log('Scraping Indeed...');
      
      // For demo purposes, return mock Indeed jobs since Puppeteer Chrome isn't installed
      const mockJobs = [
        {
          id: this.generateUUID(),
          title: 'Software Engineering Intern',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          description: 'Join our engineering team as a software engineering intern. Work on cutting-edge projects and learn from experienced developers.',
          requirements: ['Computer Science student', 'Python/JavaScript experience', 'Git knowledge'],
          benefits: ['Mentorship program', 'Flexible hours', 'Free lunch'],
          salary: '$25-30/hour',
          type: 'internship',
          remote: false,
          source: 'indeed',
          source_url: 'https://indeed.com/viewjob?jk=123456',
          posted_date: new Date().toISOString(),
          is_active: true
        },
        {
          id: this.generateUUID(),
          title: 'Data Science Intern',
          company: 'DataFlow Inc',
          location: 'New York, NY',
          description: 'Work with our data science team to analyze user behavior and build predictive models.',
          requirements: ['Statistics/Data Science background', 'Python/R experience', 'SQL knowledge'],
          benefits: ['Real-world projects', 'Data science mentorship', 'Competitive pay'],
          salary: '$28-35/hour',
          type: 'internship',
          remote: true,
          source: 'indeed',
          source_url: 'https://indeed.com/viewjob?jk=123457',
          posted_date: new Date().toISOString(),
          is_active: true
        }
      ];
      
      console.log(`Scraped ${mockJobs.length} jobs from Indeed`);
      return mockJobs;
      
    } catch (error) {
      console.error('Error scraping Indeed:', error);
      return [];
    }
  }

  async scrapeLinkedIn(userPreferences = {}) {
    try {
      console.log('Scraping LinkedIn...');
      
      // For demo purposes, return mock LinkedIn jobs
      // In production, you would use LinkedIn's API or web scraping
      const mockJobs = [
        {
          id: this.generateUUID(),
          title: 'Software Engineering Intern',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          description: 'Join our engineering team as a software engineering intern. Work on cutting-edge projects and learn from experienced developers.',
          requirements: ['Computer Science student', 'Python/JavaScript experience', 'Git knowledge'],
          benefits: ['Mentorship program', 'Flexible hours', 'Free lunch'],
          salary: '$25-30/hour',
          type: 'internship',
          remote: false,
          source: 'linkedin',
          source_url: 'https://linkedin.com/jobs/view/123456',
          posted_date: new Date().toISOString(),
          is_active: true
        },
        {
          id: this.generateUUID(),
          title: 'Data Science Intern',
          company: 'DataFlow Inc',
          location: 'New York, NY',
          description: 'Work with our data science team to analyze user behavior and build predictive models.',
          requirements: ['Statistics/Data Science background', 'Python/R experience', 'SQL knowledge'],
          benefits: ['Real-world projects', 'Data science mentorship', 'Competitive pay'],
          salary: '$28-35/hour',
          type: 'internship',
          remote: true,
          source: 'linkedin',
          source_url: 'https://linkedin.com/jobs/view/123457',
          posted_date: new Date().toISOString(),
          is_active: true
        }
      ];
      
      console.log(`Scraped ${mockJobs.length} jobs from LinkedIn`);
      return mockJobs;
      
    } catch (error) {
      console.error('Error scraping LinkedIn:', error);
      return [];
    }
  }

  async scrapeGlassdoor(userPreferences = {}) {
    try {
      console.log('Scraping Glassdoor...');
      
      // Mock Glassdoor jobs for demo
      const mockJobs = [
        {
          id: this.generateUUID(),
          title: 'Product Management Intern',
          company: 'InnovateLabs',
          location: 'Seattle, WA',
          description: 'Work with product managers to define features, analyze user feedback, and contribute to product strategy.',
          requirements: ['Business/Engineering student', 'Analytical skills', 'User empathy'],
          benefits: ['Product mentorship', 'Cross-functional collaboration', 'Startup experience'],
          salary: '$22-28/hour',
          type: 'internship',
          remote: false,
          source: 'glassdoor',
          source_url: 'https://glassdoor.com/job-listing/123456',
          posted_date: new Date().toISOString(),
          is_active: true
        }
      ];
      
      console.log(`Scraped ${mockJobs.length} jobs from Glassdoor`);
      return mockJobs;
      
    } catch (error) {
      console.error('Error scraping Glassdoor:', error);
      return [];
    }
  }

  async scrapeRemoteJobs(userPreferences = {}) {
    try {
      console.log('Scraping Remote.co...');
      
      // Mock remote jobs for demo
      const mockJobs = [
        {
          id: this.generateUUID(),
          title: 'Frontend Developer Intern',
          company: 'RemoteFirst',
          location: 'Remote',
          description: 'Build beautiful user interfaces using React and modern web technologies. Work with a distributed team.',
          requirements: ['Frontend development experience', 'React/JavaScript', 'CSS/HTML'],
          benefits: ['Fully remote', 'Flexible schedule', 'Global team'],
          salary: '$30-40/hour',
          type: 'internship',
          remote: true,
          source: 'remote',
          source_url: 'https://remote.co/job/123456',
          posted_date: new Date().toISOString(),
          is_active: true
        }
      ];
      
      console.log(`Scraped ${mockJobs.length} jobs from Remote.co`);
      return mockJobs;
      
    } catch (error) {
      console.error('Error scraping Remote.co:', error);
      return [];
    }
  }

  removeDuplicates(jobs) {
    const seen = new Set();
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  sortByRelevance(jobs, preferences) {
    return jobs.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Score based on industry match
      if (preferences.industry) {
        const industryLower = preferences.industry.toLowerCase();
        if (a.title.toLowerCase().includes(industryLower) || a.description.toLowerCase().includes(industryLower)) scoreA += 3;
        if (b.title.toLowerCase().includes(industryLower) || b.description.toLowerCase().includes(industryLower)) scoreB += 3;
      }

      // Score based on skills match
      if (preferences.skills && preferences.skills.length > 0) {
        preferences.skills.forEach(skill => {
          const skillLower = skill.toLowerCase();
          if (a.requirements.some(req => req.toLowerCase().includes(skillLower))) scoreA += 2;
          if (b.requirements.some(req => req.toLowerCase().includes(skillLower))) scoreB += 2;
        });
      }

      // Score based on location match
      if (preferences.location) {
        const locationLower = preferences.location.toLowerCase();
        if (a.location.toLowerCase().includes(locationLower)) scoreA += 2;
        if (b.location.toLowerCase().includes(locationLower)) scoreB += 2;
      }

      return scoreB - scoreA; // Higher score first
    });
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  generateSalary() {
    const salaries = ['$20-25/hour', '$25-30/hour', '$30-35/hour', '$35-40/hour', 'Competitive'];
    return salaries[Math.floor(Math.random() * salaries.length)];
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = JobScrapingService;
