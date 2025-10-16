// Job scraping service for multiple job sites
export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary: string;
  type: 'internship' | 'full-time' | 'part-time';
  remote: boolean;
  source: string;
  source_url: string;
  posted_date: string;
  application_deadline?: string;
  is_active: boolean;
}

export class JobScrapingService {
  private static instance: JobScrapingService;
  
  public static getInstance(): JobScrapingService {
    if (!JobScrapingService.instance) {
      JobScrapingService.instance = new JobScrapingService();
    }
    return JobScrapingService.instance;
  }

  // Scrape jobs from multiple sources with intelligent filtering
  async scrapeAllJobs(userPreferences?: {
    industry?: string;
    skills?: string[];
    location?: string;
    experience?: string;
  }): Promise<JobPosting[]> {
    const allJobs: JobPosting[] = [];
    
    try {
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

      // Remove duplicates based on title and company
      const uniqueJobs = this.removeDuplicates(allJobs);
      
      // Sort by relevance if user preferences are provided
      const sortedJobs = userPreferences ? this.sortByRelevance(uniqueJobs, userPreferences) : uniqueJobs;

      console.log(`Scraped ${sortedJobs.length} unique jobs from all sources`);
      return sortedJobs;
    } catch (error) {
      console.error('Error scraping jobs:', error);
      return [];
    }
  }

  // Remove duplicate jobs
  private removeDuplicates(jobs: JobPosting[]): JobPosting[] {
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

  // Sort jobs by relevance to user preferences
  private sortByRelevance(jobs: JobPosting[], preferences: {
    industry?: string;
    skills?: string[];
    location?: string;
    experience?: string;
  }): JobPosting[] {
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

  // Scrape from Indeed (using their public API or web scraping)
  private async scrapeIndeed(userPreferences?: any): Promise<JobPosting[]> {
    try {
      // For demo purposes, return mock Indeed jobs
      // In production, you would use Indeed's API or web scraping
      return [
        {
          id: `indeed-${Date.now()}-1`,
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
          id: `indeed-${Date.now()}-2`,
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
    } catch (error) {
      console.error('Error scraping Indeed:', error);
      return [];
    }
  }

  // Scrape from LinkedIn
  private async scrapeLinkedIn(userPreferences?: any): Promise<JobPosting[]> {
    try {
      // For demo purposes, return mock LinkedIn jobs
      return [
        {
          id: `linkedin-${Date.now()}-1`,
          title: 'Marketing Intern',
          company: 'GrowthCo',
          location: 'Austin, TX',
          description: 'Help our marketing team with social media campaigns, content creation, and market research.',
          requirements: ['Marketing/Communications student', 'Social media experience', 'Creative thinking'],
          benefits: ['Portfolio building', 'Networking opportunities', 'Remote work option'],
          salary: '$20-25/hour',
          type: 'internship',
          remote: true,
          source: 'linkedin',
          source_url: 'https://linkedin.com/jobs/view/123456',
          posted_date: new Date().toISOString(),
          is_active: true
        }
      ];
    } catch (error) {
      console.error('Error scraping LinkedIn:', error);
      return [];
    }
  }

  // Scrape from Glassdoor
  private async scrapeGlassdoor(userPreferences?: any): Promise<JobPosting[]> {
    try {
      // For demo purposes, return mock Glassdoor jobs
      return [
        {
          id: `glassdoor-${Date.now()}-1`,
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
    } catch (error) {
      console.error('Error scraping Glassdoor:', error);
      return [];
    }
  }

  // Scrape from Remote.co or similar remote job sites
  private async scrapeRemoteJobs(userPreferences?: any): Promise<JobPosting[]> {
    try {
      // For demo purposes, return mock remote jobs
      return [
        {
          id: `remote-${Date.now()}-1`,
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
    } catch (error) {
      console.error('Error scraping remote jobs:', error);
      return [];
    }
  }

  // Filter jobs by criteria
  filterJobs(jobs: JobPosting[], filters: {
    type?: string;
    remote?: boolean;
    location?: string;
    salary?: string;
    company?: string;
  }): JobPosting[] {
    return jobs.filter(job => {
      if (filters.type && job.type !== filters.type) return false;
      if (filters.remote !== undefined && job.remote !== filters.remote) return false;
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.company && !job.company.toLowerCase().includes(filters.company.toLowerCase())) return false;
      return true;
    });
  }

  // Search jobs by keywords
  searchJobs(jobs: JobPosting[], query: string): JobPosting[] {
    const searchTerm = query.toLowerCase();
    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm) ||
      job.company.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm) ||
      job.requirements.some(req => req.toLowerCase().includes(searchTerm))
    );
  }
}

export const jobScrapingService = JobScrapingService.getInstance();
