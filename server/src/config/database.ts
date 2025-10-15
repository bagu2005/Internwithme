import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
    
    // Initialize database tables
    await initializeTables();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Initialize database tables
const initializeTables = async (): Promise<void> => {
  const client = await pool.connect();
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('intern', 'company', 'admin')),
        avatar_url VARCHAR(500),
        google_id VARCHAR(255) UNIQUE,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_otp VARCHAR(6),
        otp_expires_at TIMESTAMP WITH TIME ZONE,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP WITH TIME ZONE,
        identity_verified BOOLEAN DEFAULT FALSE,
        identity_verification_status VARCHAR(20) DEFAULT 'pending',
        identity_verification_documents JSONB,
        identity_verification_notes TEXT,
        verified_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns if they don't exist (for existing databases)
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS verification_otp VARCHAR(6),
      ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS identity_verification_status VARCHAR(20) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS identity_verification_documents JSONB,
      ADD COLUMN IF NOT EXISTS identity_verification_notes TEXT,
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
    `);

    // Fix password_hash column to allow NULL for Google OAuth users
    try {
      await client.query(`
        ALTER TABLE users 
        ALTER COLUMN password_hash DROP NOT NULL;
      `);
      console.log('✅ Fixed password_hash constraint for Google OAuth users');
    } catch (error: any) {
      if (error.code === '42804') {
        console.log('ℹ️ password_hash column already allows NULL values');
      } else {
        console.error('❌ Error fixing password_hash constraint:', error.message);
      }
    }

    // Add stripe_customer_id column for Stripe integration
    try {
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
      `);
      console.log('✅ Added stripe_customer_id column for Stripe integration');
    } catch (error: any) {
      console.error('❌ Error adding stripe_customer_id column:', error.message);
    }

    // Create intern_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS intern_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        university VARCHAR(200),
        major VARCHAR(100),
        graduation_year INTEGER,
        skills TEXT[],
        interests TEXT[],
        experience TEXT,
        resume_url VARCHAR(500),
        portfolio_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        github_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create company_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS company_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(200) NOT NULL,
        description TEXT,
        website VARCHAR(500),
        industry VARCHAR(100),
        size VARCHAR(20) CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
        location VARCHAR(200),
        logo_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create internships table
    await client.query(`
      CREATE TABLE IF NOT EXISTS internships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT[],
        responsibilities TEXT[],
        benefits TEXT[],
        duration INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        location VARCHAR(200) NOT NULL,
        remote BOOLEAN DEFAULT FALSE,
        paid BOOLEAN DEFAULT FALSE,
        compensation_amount DECIMAL(10,2),
        compensation_currency VARCHAR(3) DEFAULT 'USD',
        compensation_type VARCHAR(20) CHECK (compensation_type IN ('hourly', 'monthly', 'stipend')),
        category VARCHAR(100),
        skills TEXT[],
        application_deadline DATE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        intern_id UUID REFERENCES users(id) ON DELETE CASCADE,
        internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
        cover_letter TEXT,
        resume_url VARCHAR(500),
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        notes TEXT,
        UNIQUE(intern_id, internship_id)
      )
    `);

    // Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        intern_id UUID REFERENCES users(id) ON DELETE CASCADE,
        company_id UUID REFERENCES users(id) ON DELETE CASCADE,
        internship_id UUID REFERENCES internships(id) ON DELETE SET NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        pros TEXT[],
        cons TEXT[],
        would_recommend BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'premium', 'pro')),
        status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
        stripe_subscription_id VARCHAR(255) UNIQUE,
        stripe_customer_id VARCHAR(255),
        current_period_start TIMESTAMP WITH TIME ZONE,
        current_period_end TIMESTAMP WITH TIME ZONE,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create subscription_features table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_features (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        feature VARCHAR(50) NOT NULL,
        usage_count INTEGER DEFAULT 0,
        limit_count INTEGER DEFAULT 0,
        reset_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, feature)
      )
    `);

    // Create ai_generations table (for tracking AI feature usage)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_generations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('cover_letter', 'resume_optimization', 'job_matching')),
        input_data JSONB,
        output_data JSONB,
        tokens_used INTEGER DEFAULT 0,
        cost DECIMAL(10,4) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_internships_company_id ON internships(company_id);
      CREATE INDEX IF NOT EXISTS idx_internships_is_active ON internships(is_active);
      CREATE INDEX IF NOT EXISTS idx_internships_category ON internships(category);
      CREATE INDEX IF NOT EXISTS idx_internships_location ON internships(location);
      CREATE INDEX IF NOT EXISTS idx_internships_paid ON internships(paid);
      CREATE INDEX IF NOT EXISTS idx_internships_remote ON internships(remote);
      CREATE INDEX IF NOT EXISTS idx_applications_intern_id ON applications(intern_id);
      CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON applications(internship_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
      CREATE INDEX IF NOT EXISTS idx_reviews_company_id ON reviews(company_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_intern_id ON reviews(intern_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
      CREATE INDEX IF NOT EXISTS idx_subscription_features_user_id ON subscription_features(user_id);
      CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
      CREATE INDEX IF NOT EXISTS idx_ai_generations_type ON ai_generations(type);
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
    throw error;
  } finally {
    client.release();
  }
};
