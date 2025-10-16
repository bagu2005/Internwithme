import { pool } from './database';

export const migrateToJobAggregation = async (): Promise<void> => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migration to job aggregation platform...');
    
    // Check if job_postings table exists
    const jobPostingsExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'job_postings'
      );
    `);
    
    if (!jobPostingsExists.rows[0].exists) {
      console.log('📊 Creating job_postings table...');
      
      // Create job_postings table
      await client.query(`
        CREATE TABLE job_postings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(200) NOT NULL,
          company VARCHAR(200) NOT NULL,
          location VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          requirements TEXT[],
          benefits TEXT[],
          salary VARCHAR(100),
          type VARCHAR(20) CHECK (type IN ('internship', 'full-time', 'part-time')) DEFAULT 'internship',
          remote BOOLEAN DEFAULT FALSE,
          source VARCHAR(50) NOT NULL,
          source_url VARCHAR(500) UNIQUE NOT NULL,
          posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          application_deadline TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_job_postings_company ON job_postings(company);
        CREATE INDEX idx_job_postings_is_active ON job_postings(is_active);
        CREATE INDEX idx_job_postings_type ON job_postings(type);
        CREATE INDEX idx_job_postings_location ON job_postings(location);
        CREATE INDEX idx_job_postings_remote ON job_postings(remote);
        CREATE INDEX idx_job_postings_source ON job_postings(source);
      `);
      
      console.log('✅ job_postings table created');
    }
    
    // Check if internships table exists and migrate data if needed
    const internshipsExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'internships'
      );
    `);
    
    if (internshipsExists.rows[0].exists) {
      console.log('🔄 Migrating internships data to job_postings...');
      
      // Migrate existing internships to job_postings
      await client.query(`
        INSERT INTO job_postings (
          title, company, location, description, requirements, benefits,
          salary, type, remote, source, source_url, posted_date, application_deadline
        )
        SELECT 
          title,
          (SELECT company_name FROM users WHERE id = company_id) as company,
          location,
          description,
          requirements,
          benefits,
          CASE 
            WHEN paid THEN CONCAT(compensation_amount, ' ', compensation_currency, '/', compensation_type)
            ELSE NULL
          END as salary,
          'internship' as type,
          remote,
          'Legacy Platform' as source,
          CONCAT('legacy-', id) as source_url,
          created_at as posted_date,
          application_deadline
        FROM internships
        WHERE is_active = true
        ON CONFLICT (source_url) DO NOTHING
      `);
      
      console.log('✅ Internships data migrated to job_postings');
    }
    
    // Update applications table to reference job_postings instead of internships
    const applicationsExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'applications'
      );
    `);
    
    if (applicationsExists.rows[0].exists) {
      // Check if the column exists and rename if needed
      const columnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'applications' 
          AND column_name = 'internship_id'
        );
      `);
      
      if (columnExists.rows[0].exists) {
        console.log('🔄 Updating applications table...');
        
        // Add new column if it doesn't exist
        await client.query(`
          ALTER TABLE applications 
          ADD COLUMN IF NOT EXISTS job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE
        `);
        
        // Migrate data from internship_id to job_posting_id
        await client.query(`
          UPDATE applications 
          SET job_posting_id = (
            SELECT jp.id 
            FROM job_postings jp 
            WHERE jp.source_url = CONCAT('legacy-', applications.internship_id)
          )
          WHERE internship_id IS NOT NULL
        `);
        
        // Drop the old column
        await client.query(`
          ALTER TABLE applications DROP COLUMN IF EXISTS internship_id
        `);
        
        // Rename user_id column if it's still called intern_id
        const internIdExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'applications' 
            AND column_name = 'intern_id'
          );
        `);
        
        if (internIdExists.rows[0].exists) {
          await client.query(`
            ALTER TABLE applications RENAME COLUMN intern_id TO user_id
          `);
        }
        
        console.log('✅ Applications table updated');
      }
    }
    
    // Update reviews table
    const reviewsExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews'
      );
    `);
    
    if (reviewsExists.rows[0].exists) {
      console.log('🔄 Updating reviews table...');
      
      // Add company column if it doesn't exist
      await client.query(`
        ALTER TABLE reviews 
        ADD COLUMN IF NOT EXISTS company VARCHAR(200)
      `);
      
      // Add job_posting_id column if it doesn't exist
      await client.query(`
        ALTER TABLE reviews 
        ADD COLUMN IF NOT EXISTS job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL
      `);
      
      // Update company names from company_id
      await client.query(`
        UPDATE reviews 
        SET company = (
          SELECT company_name 
          FROM users 
          WHERE id = reviews.company_id
        )
        WHERE company_id IS NOT NULL AND company IS NULL
      `);
      
      // Rename intern_id to user_id if needed
      const internIdExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'reviews' 
          AND column_name = 'intern_id'
        );
      `);
      
      if (internIdExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE reviews RENAME COLUMN intern_id TO user_id
        `);
      }
      
      console.log('✅ Reviews table updated');
    }
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};
