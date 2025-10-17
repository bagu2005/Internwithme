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

      console.log(`Attempting to add ${jobs.length} jobs to database...`);

      // Use upsert to handle duplicates gracefully
      const { data, error } = await this.supabase
        .from('job_postings')
        .upsert(jobs, { 
          onConflict: 'source_url',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('Error adding jobs:', error);
        // Don't throw error, just log it and continue
        return [];
      }

      console.log(`✅ Successfully added ${data ? data.length : 0} jobs to database`);
      return data || [];
    } catch (error) {
      console.error('Error in addJobs:', error);
      // Don't throw error, just return empty array
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

  async clearJobs() {
    try {
      const { error } = await this.supabase
        .from('job_postings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) {
        console.error('Error clearing jobs:', error);
        throw error;
      }

      console.log('All jobs cleared from database');
      return true;
    } catch (error) {
      console.error('Error in clearJobs:', error);
      throw error;
    }
  }
}

module.exports = SupabaseService;
