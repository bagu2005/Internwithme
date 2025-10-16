# Setup User Preferences Table in Supabase

## Step 1: Run the SQL Script

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-user-preferences.sql`
4. Click "Run" to execute the script

## Step 2: Verify the Table

After running the script, you should see:
- A new `user_preferences` table
- Row Level Security (RLS) enabled
- Proper policies for user data access
- An `updated_at` trigger

## Step 3: Test the Integration

1. Go to your profile page
2. Set your job preferences (major, industry, skills, etc.)
3. Click "Save Changes"
4. Check the `user_preferences` table in Supabase to see your data

## What This Enables:

✅ **Persistent Job Preferences** - Your preferences are saved to the database
✅ **Personalized Job Matching** - Jobs are filtered based on your saved preferences  
✅ **Cross-Session Persistence** - Preferences persist when you log out and back in
✅ **Real-time Updates** - Changes are immediately saved and applied

## LinkedIn URL Improvements:

The LinkedIn links now include:
- **Better search terms**: "Software Engineer Google internship" instead of just "Software Engineer"
- **Job type filter**: `f_JT=I` (Internship jobs only)
- **Experience filter**: `f_E=2` (Entry level)
- **Recent postings**: `f_TPR=r86400` (Last 24 hours)
- **Location**: Singapore

This should give you much more accurate and relevant job results!
