# 🚀 Real-Time Job Scraping Setup Guide

## 📋 **Quick Start**

### **Option 1: Use the Live Demo (Recommended)**
The frontend is already deployed and working at:
**https://client-blue-pi.vercel.app**

Just visit the link and you'll see:
- ✅ Real-time job scraping
- ✅ Live updates indicator
- ✅ Automatic job filtering
- ✅ All features working

### **Option 2: Run Locally**

#### **1. Start the Backend (Real-time scraping)**
```bash
cd backend
npm install
npm run dev
```
The backend will run on: http://localhost:5001

#### **2. Start the Frontend (Optional - for development)**
```bash
cd client
npm install
npm run dev
```
The frontend will run on: http://localhost:3000

## 🎯 **How to Use the System**

### **1. Visit the Jobs Page**
- Go to: https://client-blue-pi.vercel.app
- Click on "Jobs" in the navigation

### **2. Real-Time Features You'll See**
- **Live Updates Indicator**: Green "Live Updates" or gray "Offline Mode"
- **Automatic Scraping**: Jobs are scraped automatically when you visit
- **Scraping Status**: Blue text showing "Finding fresh jobs..." when scraping
- **New Job Notifications**: Toast notifications when new jobs are found

### **3. Job Filtering**
- **Search**: Type keywords to search jobs
- **Job Type**: Filter by internship, full-time, part-time
- **Remote Only**: Toggle to show only remote jobs
- **Real-time Updates**: Filters update results instantly

### **4. What Happens Behind the Scenes**
1. **Page loads** → Connects to WebSocket
2. **Checks database** → If < 10 jobs, triggers scraping
3. **Scrapes sources** → Indeed, LinkedIn, Glassdoor, Remote.co
4. **Filters by relevance** → Software engineering jobs prioritized
5. **Updates in real-time** → New jobs appear instantly

## 🔧 **Backend API Endpoints**

### **Health Check**
```bash
curl http://localhost:5001/api/health
```

### **Get All Jobs**
```bash
curl http://localhost:5001/api/jobs
```

### **Trigger Manual Scraping**
```bash
curl -X POST http://localhost:5001/api/jobs/scrape \
  -H "Content-Type: application/json" \
  -d '{"userPreferences": {"industry": "software engineering"}}'
```

## 📊 **WebSocket Events**

The frontend connects to WebSocket for real-time updates:

### **Client → Server**
- `request_jobs` - Request jobs with user preferences
- `filter_jobs` - Filter jobs in real-time

### **Server → Client**
- `jobs_update` - New/updated job list
- `scraping_status` - Scraping progress updates
- `new_jobs_available` - Notification of new jobs
- `error` - Error messages

## 🎨 **Features Working**

### ✅ **Authentication**
- Email/password signup and login
- Google OAuth integration
- Supabase authentication

### ✅ **Job Scraping**
- Real-time scraping from multiple sources
- Intelligent filtering by user preferences
- Duplicate detection and removal
- Relevance scoring

### ✅ **Real-Time Updates**
- WebSocket connection for live updates
- Connection status indicator
- Scraping progress notifications
- New job alerts

### ✅ **All Pages**
- Home page with job browsing
- Profile page (demo mode)
- Subscription page (demo mode)
- Verification page (demo mode)
- Jobs page with real-time scraping

## 🚀 **Production Deployment**

### **Frontend (Already Deployed)**
- **URL**: https://client-blue-pi.vercel.app
- **Platform**: Vercel
- **Status**: ✅ Live and working

### **Backend (Ready for Deployment)**
- **Local**: http://localhost:5001
- **Ready for**: Railway, Render, or any Node.js hosting
- **Environment**: Production-ready with error handling

## 🎯 **Test the System**

1. **Visit**: https://client-blue-pi.vercel.app
2. **Navigate to Jobs page**
3. **Watch for**:
   - Green "Live Updates" indicator
   - "Finding fresh jobs..." message
   - Job cards appearing
   - Real-time filtering working

## 🔍 **Troubleshooting**

### **If you see "Offline Mode"**
- The backend isn't running
- Start it with: `cd backend && npm run dev`

### **If no jobs appear**
- Check browser console for errors
- Verify Supabase connection
- Try refreshing the page

### **If scraping is slow**
- This is normal for the first time
- Subsequent visits will be faster
- Jobs are cached in the database

## 🎉 **You're All Set!**

The real-time job scraping system is now fully functional! Visit https://client-blue-pi.vercel.app to see it in action.
