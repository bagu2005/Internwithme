import { supabase } from './supabase'

export interface UserPreferences {
  id?: string
  user_id?: string
  major?: string
  industry?: string
  skills?: string[]
  location?: string
  salary_range_min?: number
  salary_range_max?: number
  work_arrangement?: 'remote' | 'onsite' | 'hybrid' | 'any'
  experience_level?: 'entry' | 'mid' | 'senior' | 'any'
  company_size?: 'startup' | 'medium' | 'large' | 'any'
  created_at?: string
  updated_at?: string
}

class UserPreferencesService {
  // Get user preferences
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, return null
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      throw error
    }
  }

  // Save or update user preferences
  async savePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      // First, try to get existing preferences
      const existing = await this.getPreferences(userId)

      if (existing) {
        // Update existing preferences
        const { data, error } = await supabase
          .from('user_preferences')
          .update({
            major: preferences.major,
            industry: preferences.industry,
            skills: preferences.skills,
            location: preferences.location,
            salary_range_min: preferences.salary_range_min,
            salary_range_max: preferences.salary_range_max,
            work_arrangement: preferences.work_arrangement,
            experience_level: preferences.experience_level,
            company_size: preferences.company_size,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Create new preferences
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            major: preferences.major,
            industry: preferences.industry,
            skills: preferences.skills,
            location: preferences.location,
            salary_range_min: preferences.salary_range_min,
            salary_range_max: preferences.salary_range_max,
            work_arrangement: preferences.work_arrangement,
            experience_level: preferences.experience_level,
            company_size: preferences.company_size
          })
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error saving user preferences:', error)
      throw error
    }
  }

  // Delete user preferences
  async deletePreferences(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting user preferences:', error)
      throw error
    }
  }

  // Get preferences for job matching
  async getPreferencesForJobMatching(userId: string): Promise<Partial<UserPreferences>> {
    try {
      const preferences = await this.getPreferences(userId)
      
      if (!preferences) {
        return {}
      }

      return {
        major: preferences.major,
        industry: preferences.industry,
        skills: preferences.skills,
        location: preferences.location,
        salary_range_min: preferences.salary_range_min,
        salary_range_max: preferences.salary_range_max,
        work_arrangement: preferences.work_arrangement,
        experience_level: preferences.experience_level,
        company_size: preferences.company_size
      }
    } catch (error) {
      console.error('Error getting preferences for job matching:', error)
      return {}
    }
  }
}

export const userPreferencesService = new UserPreferencesService()
export default userPreferencesService
