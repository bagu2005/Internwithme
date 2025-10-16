const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || 'https://uffhindidvnnqvgbjqxe.supabase.co',
      process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZmhpbmRpZHZubnF2Z2JqcXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzU4NzIsImV4cCI6MjA3NjE1MTg3Mn0.9f1JsIks99XCOvfJOKVTNvBU1sIIlnKvRKeDwcVquYs'
    );
  }

  async getJobs(filters = {}) {
    try {
      let query = this.supabase
        .from('job_postings')
        .select('*')
        .eq('is_active', true)
        .order('posted_date', { ascending: false });

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.remote !== undefined) {
        query = query.eq('remote', filters.remote);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.company) {
        query = query.ilike('company', `%${filters.company}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getJobs:', error);
      return [];
    }
  }

  async addJobs(jobs) {
    try {
      if (!jobs || jobs.length === 0) {
        return [];
      }

      // Check for existing jobs to avoid duplicates
      const existingJobs = await this.getJobs();
      const existingUrls = new Set(existingJobs.map(job => job.source_url));
      
      // Filter out duplicate jobs
      const newJobs = jobs.filter(job => !existingUrls.has(job.source_url));
      
      if (newJobs.length === 0) {
        console.log('No new jobs to add (all duplicates)');
        return [];
      }

      const { data, error } = await this.supabase
        .from('job_postings')
        .insert(newJobs)
        .select();

      if (error) {
        console.error('Error adding jobs:', error);
        throw error;
      }

      console.log(`Added ${data.length} new jobs to database`);
      return data;
    } catch (error) {
      console.error('Error in addJobs:', error);
      return [];
    }
  }

  async getJobStats() {
    try {
      const { count: total } = await this.supabase
        .from('job_postings')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      const { count: internships } = await this.supabase
        .from('job_postings')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .eq('type', 'internship');

      const { count: remote } = await this.supabase
        .from('job_postings')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .eq('remote', true);

      const { count: paid } = await this.supabase
        .from('job_postings')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .not('salary', 'is', null);

      return {
        total: total || 0,
        internships: internships || 0,
        remote: remote || 0,
        paid: paid || 0
      };
    } catch (error) {
      console.error('Error getting job stats:', error);
      return { total: 0, internships: 0, remote: 0, paid: 0 };
    }
  }

  async getJobById(id) {
    try {
      const { data, error } = await this.supabase
        .from('job_postings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching job by ID:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getJobById:', error);
      return null;
    }
  }

  async updateJob(id, updates) {
    try {
      const { data, error } = await this.supabase
        .from('job_postings')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating job:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateJob:', error);
      return null;
    }
  }

  async deleteJob(id) {
    try {
      const { error } = await this.supabase
        .from('job_postings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting job:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteJob:', error);
      return false;
    }
  }
}

module.exports = SupabaseService;
