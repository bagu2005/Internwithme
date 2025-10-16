# 🚀 Supabase Setup Guide

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub
4. Create new project
5. Choose region (closest to your users)
6. Set password for database

### 2. Get API Keys
1. Go to Project Settings → API
2. Copy:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Create Database Tables
Run this SQL in Supabase SQL Editor:

```sql
-- Create job_postings table
CREATE TABLE job_postings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  posted_date TIMESTAMP DEFAULT NOW(),
  application_deadline TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data
INSERT INTO job_postings (title, company, location, description, requirements, benefits, salary, type, remote, source, source_url, application_deadline)
VALUES 
  ('Software Engineering Intern', 'TechCorp', 'San Francisco, CA', 'Join our engineering team for a summer internship...', ARRAY['Computer Science student', 'Python/JavaScript experience'], ARRAY['Mentorship', 'Free lunch', 'Flexible hours'], '$25-30/hour', 'internship', false, 'Indeed', 'https://indeed.com/viewjob?jk=123', NOW() + INTERVAL '30 days'),
  ('Marketing Intern', 'StartupXYZ', 'Remote', 'Help us grow our brand and reach new customers...', ARRAY['Marketing or Business student', 'Social media experience'], ARRAY['Remote work', 'Learning opportunities'], '$20-25/hour', 'internship', true, 'LinkedIn', 'https://linkedin.com/jobs/view/124', NOW() + INTERVAL '45 days'),
  ('Data Science Intern', 'DataCorp', 'New York, NY', 'Work with our data team to analyze user behavior...', ARRAY['Statistics/Data Science student', 'Python/R experience'], ARRAY['Real-world projects', 'Data science mentorship'], '$28-35/hour', 'internship', false, 'Glassdoor', 'https://glassdoor.com/job-listing/125', NOW() + INTERVAL '20 days');

-- Enable Row Level Security
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON job_postings
  FOR SELECT USING (true);
```

### 4. Update Environment Variables
Add to Vercel project settings:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Deploy
```bash
npm run build
npx vercel --prod
```

## ✅ Benefits of Supabase

- **No deployment issues** - Just works
- **Built-in authentication** - No OAuth setup needed
- **Real-time updates** - Jobs update automatically
- **Free tier** - 500MB database, 50MB file storage
- **Easy scaling** - Handles traffic automatically

## 🧪 Test Data

Once setup is complete, you'll have:
- 3 sample job postings
- Working authentication
- Real-time job updates
- No backend deployment issues

## 🔧 Alternative: Firebase

If you prefer Google ecosystem:
1. Go to [firebase.google.com](https://firebase.google.com)
2. Create project
3. Enable Firestore Database
4. Enable Authentication
5. Get config keys
6. Update environment variables

Both solutions are much more reliable than Railway!
