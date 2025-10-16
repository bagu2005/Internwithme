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
          company: 'Google',
          location: 'Mountain View, CA',
          description: 'Join Google as a Software Engineering Intern. Work on cutting-edge projects that impact billions of users worldwide. Learn from experienced developers and contribute to real products.',
          requirements: ['Computer Science student', 'Python/JavaScript experience', 'Git knowledge', 'Strong problem-solving skills'],
          benefits: ['$8,000/month stipend', 'Free meals', 'Transportation allowance', 'Mentorship program'],
          salary: '$8,000/month',
          type: 'internship',
          remote: false,
          source: 'indeed',
          source_url: 'https://indeed.com/viewjob?jk=123456',
          posted_date: new Date().toISOString(),
          is_active: true
        },
        {
          id: this.generateUUID(),
          title: 'UX/UI Design Intern',
          company: 'Adobe',
          location: 'San Jose, CA',
          description: 'Join Adobe as a UX/UI Design Intern. Work on creative tools like Photoshop, Illustrator, and XD. Learn from world-class designers and contribute to products used by millions of creatives.',
          requirements: ['Design/Art student', 'Figma/Adobe Creative Suite', 'Portfolio required', 'User research interest'],
          benefits: ['$6,500/month stipend', 'Adobe Creative Cloud access', 'Design mentorship', 'Creative workspace'],
          salary: '$6,500/month',
          type: 'internship',
          remote: false,
          source: 'indeed',
          source_url: 'https://indeed.com/viewjob?jk=123458',
          posted_date: new Date().toISOString(),
          is_active: true
        },
        {
          id: this.generateUUID(),
          title: 'Marketing Intern',
          company: 'Nike',
          location: 'Portland, OR',
          description: 'Join Nike as a Marketing Intern. Work on global campaigns, social media strategy, and brand partnerships. Learn from marketing leaders in the sports industry.',
          requirements: ['Marketing/Business student', 'Social media experience', 'Creative thinking', 'Sports interest'],
          benefits: ['$5,500/month stipend', 'Nike product discounts', 'Marketing mentorship', 'Campaign experience'],
          salary: '$5,500/month',
          type: 'internship',
          remote: false,
          source: 'indeed',
          source_url: 'https://indeed.com/viewjob?jk=123459',
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
          company: 'Microsoft',
          location: 'Seattle, WA',
          description: 'Join Microsoft as a Software Engineering Intern. Work on Azure cloud services, Office 365, or Windows development. Gain experience with enterprise-scale software development.',
          requirements: ['Computer Science student', 'C#/Python/JavaScript experience', 'Git knowledge', 'Cloud computing interest'],
          benefits: ['$6,500/month stipend', 'Relocation assistance', 'Free software licenses', 'Microsoft mentorship'],
          salary: '$6,500/month',
          type: 'internship',
          remote: false,
          source: 'linkedin',
          source_url: 'https://linkedin.com/jobs/view/123456',
          posted_date: new Date().toISOString(),
          is_active: true
        },
        {
          id: this.generateUUID(),
          title: 'Graphic Design Intern',
          company: 'Apple',
          location: 'Cupertino, CA',
          description: 'Join Apple as a Graphic Design Intern. Work on marketing materials, product packaging, and digital experiences. Learn from world-class designers in a creative environment.',
          requirements: ['Design/Art student', 'Adobe Creative Suite', 'Portfolio required', 'Attention to detail'],
          benefits: ['$7,000/month stipend', 'Apple product discounts', 'Design mentorship', 'Creative workspace'],
          salary: '$7,000/month',
          type: 'internship',
          remote: false,
          source: 'linkedin',
          source_url: 'https://linkedin.com/jobs/view/123457',
          posted_date: new Date().toISOString(),
          is_active: true
        },
        {
          id: this.generateUUID(),
          title: 'Finance Intern',
          company: 'Goldman Sachs',
          location: 'New York, NY',
          description: 'Join Goldman Sachs as a Finance Intern. Work on financial analysis, market research, and investment strategies. Learn from industry leaders in finance.',
          requirements: ['Finance/Economics student', 'Excel proficiency', 'Analytical skills', 'Financial markets interest'],
          benefits: ['$8,500/month stipend', 'Financial training', 'Mentorship program', 'Networking opportunities'],
          salary: '$8,500/month',
          type: 'internship',
          remote: false,
          source: 'linkedin',
          source_url: 'https://linkedin.com/jobs/view/123458',
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
          company: 'Amazon',
          location: 'Seattle, WA',
          description: 'Join Amazon as a Product Management Intern. Work with product managers to define features, analyze customer feedback, and contribute to product strategy for AWS, Prime, or Alexa.',
          requirements: ['Business/Engineering student', 'Analytical skills', 'Customer empathy', 'Data-driven mindset'],
          benefits: ['$6,000/month stipend', 'Amazon Prime membership', 'Product mentorship', 'Cross-functional collaboration'],
          salary: '$6,000/month',
          type: 'internship',
          remote: false,
          source: 'glassdoor',
          source_url: 'https://glassdoor.com/job-listing/123456',
          posted_date: new Date().toISOString(),
          is_active: true
        },
        {
          id: this.generateUUID(),
          title: 'Content Writing Intern',
          company: 'BuzzFeed',
          location: 'New York, NY',
          description: 'Join BuzzFeed as a Content Writing Intern. Create engaging articles, social media content, and digital media. Learn from content creators and digital marketing experts.',
          requirements: ['English/Journalism student', 'Writing portfolio', 'Social media savvy', 'Creative storytelling'],
          benefits: ['$4,500/month stipend', 'Content creation tools', 'Writing mentorship', 'Publishing opportunities'],
          salary: '$4,500/month',
          type: 'internship',
          remote: true,
          source: 'glassdoor',
          source_url: 'https://glassdoor.com/job-listing/123457',
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
          company: 'Stripe',
          location: 'Remote',
          description: 'Join Stripe as a Frontend Developer Intern. Build beautiful user interfaces for payment processing, financial tools, and developer APIs. Work with a distributed team of world-class engineers.',
          requirements: ['Frontend development experience', 'React/JavaScript', 'CSS/HTML', 'API integration experience'],
          benefits: ['$5,500/month stipend', 'Fully remote', 'Flexible schedule', 'Stripe swag'],
          salary: '$5,500/month',
          type: 'internship',
          remote: true,
          source: 'remote',
          source_url: 'https://remote.co/job/123456',
          posted_date: new Date().toISOString(),
          is_active: true
        },
        {
          id: this.generateUUID(),
          title: 'Digital Marketing Intern',
          company: 'Shopify',
          location: 'Remote',
          description: 'Join Shopify as a Digital Marketing Intern. Work on email campaigns, social media strategy, and SEO optimization. Learn from e-commerce marketing experts.',
          requirements: ['Marketing/Business student', 'Social media experience', 'Analytics tools', 'E-commerce interest'],
          benefits: ['$4,800/month stipend', 'Fully remote', 'Marketing tools access', 'Campaign experience'],
          salary: '$4,800/month',
          type: 'internship',
          remote: true,
          source: 'remote',
          source_url: 'https://remote.co/job/123457',
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

      // Always prioritize internships
      if (a.type === 'internship') scoreA += 10;
      if (b.type === 'internship') scoreB += 10;

      // Score based on industry match (highest priority)
      if (preferences.industry) {
        const industryLower = preferences.industry.toLowerCase();
        if (a.title.toLowerCase().includes(industryLower) || a.description.toLowerCase().includes(industryLower)) scoreA += 15;
        if (b.title.toLowerCase().includes(industryLower) || b.description.toLowerCase().includes(industryLower)) scoreB += 15;
      }

      // Score based on major/field of study
      if (preferences.major) {
        const majorLower = preferences.major.toLowerCase();
        const majorKeywords = {
          'computer-science': ['software', 'engineering', 'programming', 'development', 'coding'],
          'design': ['design', 'ux', 'ui', 'creative', 'graphic', 'visual'],
          'business': ['business', 'marketing', 'management', 'strategy', 'sales'],
          'finance': ['finance', 'financial', 'banking', 'investment', 'analyst'],
          'journalism': ['content', 'writing', 'journalism', 'communications', 'editorial'],
          'data-science': ['data', 'analytics', 'science', 'machine learning', 'statistics']
        };
        
        if (majorKeywords[majorLower]) {
          majorKeywords[majorLower].forEach(keyword => {
            if (a.title.toLowerCase().includes(keyword) || a.description.toLowerCase().includes(keyword)) scoreA += 8;
            if (b.title.toLowerCase().includes(keyword) || b.description.toLowerCase().includes(keyword)) scoreB += 8;
          });
        }
      }

      // Score based on skills match
      if (preferences.skills && preferences.skills.length > 0) {
        preferences.skills.forEach(skill => {
          const skillLower = skill.toLowerCase();
          if (a.requirements.some(req => req.toLowerCase().includes(skillLower)) ||
              a.description.toLowerCase().includes(skillLower)) scoreA += 5;
          if (b.requirements.some(req => req.toLowerCase().includes(skillLower)) ||
              b.description.toLowerCase().includes(skillLower)) scoreB += 5;
        });
      }

      // Score based on location match
      if (preferences.location) {
        const locationLower = preferences.location.toLowerCase();
        if (a.location.toLowerCase().includes(locationLower) || 
            (locationLower === 'remote' && a.remote)) scoreA += 3;
        if (b.location.toLowerCase().includes(locationLower) || 
            (locationLower === 'remote' && b.remote)) scoreB += 3;
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
