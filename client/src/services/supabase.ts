import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uffhindidvnnqvgbjqxe.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZmhpbmRpZHZubnF2Z2JqcXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzU4NzIsImV4cCI6MjA3NjE1MTg3Mn0.9f1JsIks99XCOvfJOKVTNvBU1sIIlnKvRKeDwcVquYs'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Job-related functions
export const jobService = {
  // Get all jobs with automatic scraping
  async getJobs() {
    // First, try to get existing jobs from database
    const { data: existingJobs, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('posted_date', { ascending: false })
    
    if (error) throw error

    // If we have less than 5 jobs, automatically scrape new ones
    if (!existingJobs || existingJobs.length < 5) {
      console.log('Auto-scraping jobs to populate database...')
      try {
        await this.triggerScraping()
        // Fetch updated jobs after scraping
        const { data: updatedJobs, error: updateError } = await supabase
          .from('job_postings')
          .select('*')
          .order('posted_date', { ascending: false })
        
        if (updateError) throw updateError
        return updatedJobs || []
      } catch (scrapeError) {
        console.error('Auto-scraping failed:', scrapeError)
        return existingJobs || []
      }
    }

    return existingJobs || []
  },

  // Add new jobs from scraping
  async addJobs(jobs: any[]) {
    const { data, error } = await supabase
      .from('job_postings')
      .insert(jobs)
      .select()
    
    if (error) throw error
    return data
  },

  // Trigger job scraping
  async triggerScraping() {
    // This would typically call a backend endpoint
    // For now, we'll handle it on the frontend
    const { jobScrapingService } = await import('./jobScrapingService');
    const scrapedJobs = await jobScrapingService.scrapeAllJobs();
    
    // Add scraped jobs to database
    if (scrapedJobs.length > 0) {
      return await this.addJobs(scrapedJobs);
    }
    
    return [];
  },

  // Get job by ID
  async getJobById(id: string) {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Get job recommendations for user
  async getJobRecommendations(userId: string) {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('posted_date', { ascending: false })
      .limit(20)
    
    if (error) throw error
    return data
  },

  // Get job statistics
  async getJobStats() {
    const { data, error } = await supabase
      .from('job_postings')
      .select('type, remote, salary')
    
    if (error) throw error
    
    const stats = {
      total: data.length,
      internships: data.filter(job => job.type === 'internship').length,
      remote: data.filter(job => job.remote).length,
      paid: data.filter(job => job.salary).length
    }
    
    return stats
  }
}

// Auth functions
export const authService = {
  // Sign in with Google (OAuth)
  async signInWithGoogle() {
    const redirectTo = window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    })
    if (error) throw error
    return data
  },

  // Sign up
  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) throw error
    return data
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}
