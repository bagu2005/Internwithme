import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Clock, DollarSign, Building, Filter, RefreshCw, Wifi, WifiOff, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react'
import { jobApi } from '../services/api'
import { realTimeService } from '../services/realTimeService'
import { userPreferencesService } from '../services/userPreferencesService'
import { toast } from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import AdvancedFilters from '../components/AdvancedFilters'
import ApplicationPlanner from '../components/ApplicationPlanner'

// Job interface
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary?: string;
  type: 'internship' | 'full-time' | 'part-time';
  remote: boolean;
  source: string;
  sourceUrl: string;
  postedDate: string;
  applicationDeadline?: string;
}

// Filter interface
interface FilterState {
  salaryRange: [number, number]
  companySize: string[]
  workArrangement: string[]
  applicationDeadline: string[]
  experienceLevel: string[]
  industry: string[]
  skills: string[]
  location: string
}

// Application tracking interface
interface Application {
  jobId: string
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  appliedDate?: string
  notes?: string
}

export default function InternshipsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, internships: 0, remote: 0, paid: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showRemoteOnly, setShowRemoteOnly] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [scrapingStatus, setScrapingStatus] = useState('')
  const [userPreferences, setUserPreferences] = useState({
    industry: '',
    skills: [] as string[],
    location: '',
    experience: 'internship'
  })
  
  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showApplicationPlanner, setShowApplicationPlanner] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    salaryRange: [0, 10000],
    companySize: [],
    workArrangement: [],
    applicationDeadline: [],
    experienceLevel: [],
    industry: [],
    skills: [],
    location: ''
  })
  
  // Application tracking state
  const [applications, setApplications] = useState<Map<string, Application>>(new Map())
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())

  // Get user preferences from profile (for now, use demo data)
  const getUserPreferences = () => {
    // For now, return demo preferences since we don't have a profiles table yet
    // In the future, this would fetch from the user's profile
    return {
      industry: 'software engineering',
      skills: ['javascript', 'python', 'react', 'node.js'],
      location: '',
      experience: 'internship'
    }
  }

  // Application tracking functions
  const saveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs)
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId)
      toast.success('Job removed from saved')
      
      // Remove from localStorage
      const savedJobsData = JSON.parse(localStorage.getItem('savedJobs') || '[]')
      const updatedSavedJobs = savedJobsData.filter((job: any) => job.jobId !== jobId)
      localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs))
    } else {
      newSavedJobs.add(jobId)
      toast.success('Job saved!')
      
      // Add to localStorage
      const job = jobs.find(j => j.id === jobId)
      if (job) {
        const savedJobsData = JSON.parse(localStorage.getItem('savedJobs') || '[]')
        const newSavedJob = {
          jobId: job.id,
          savedDate: new Date().toISOString(),
          job: {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            type: job.type,
            description: job.description,
            sourceUrl: job.sourceUrl,
            source: job.source
          }
        }
        savedJobsData.push(newSavedJob)
        localStorage.setItem('savedJobs', JSON.stringify(savedJobsData))
      }
    }
    setSavedJobs(newSavedJobs)
  }

  const applyToJob = (job: Job) => {
    const newApplications = new Map(applications)
    const newApplication = {
      jobId: job.id,
      status: 'applied' as const,
      appliedDate: new Date().toISOString(),
      notes: '',
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        type: job.type,
        description: job.description,
        sourceUrl: job.sourceUrl,
        source: job.source
      }
    }
    newApplications.set(job.id, newApplication)
    setApplications(newApplications)
    
    // Save to localStorage
    const applicationsData = JSON.parse(localStorage.getItem('applications') || '[]')
    applicationsData.push(newApplication)
    localStorage.setItem('applications', JSON.stringify(applicationsData))
    
    toast.success(`Applied to ${job.title} at ${job.company}`)
  }

  const updateApplicationStatus = (jobId: string, status: Application['status']) => {
    const newApplications = new Map(applications)
    const currentApp = newApplications.get(jobId)
    if (currentApp) {
      newApplications.set(jobId, { ...currentApp, status })
      setApplications(newApplications)
      toast.success(`Application status updated to ${status}`)
    }
  }

  // Extract salary from job description for filtering
  const extractSalary = (job: Job): number => {
    if (!job.salary) return 0
    const match = job.salary.match(/\$?(\d+(?:,\d{3})*)/)
    return match ? parseInt(match[1].replace(/,/g, '')) : 0
  }

  // Determine company size based on company name (realistic logic)
  const getCompanySize = (company: string): string => {
    const enterpriseCompanies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'DBS', 'OCBC', 'UOB', 'Singtel', 'StarHub', 'McKinsey', 'PwC', 'Deloitte', 'KPMG', 'EY']
    const largeCompanies = ['Shopee', 'Grab', 'Sea Limited', 'Razer', 'Ninja Van', 'Carousell', '99.co', 'GovTech', 'A*STAR', 'Enterprise Singapore']
    const mediumCompanies = ['Design Studio', 'Digital Agency', 'Tech Startup', 'Innovation Lab', 'Creative Agency']
    
    if (enterpriseCompanies.some(name => company.includes(name))) return 'enterprise'
    if (largeCompanies.some(name => company.includes(name))) return 'large'
    if (mediumCompanies.some(name => company.includes(name))) return 'medium'
    if (company.includes('Singapore') || company.includes('GovTech') || company.includes('A*STAR')) return 'large'
    return 'startup'
  }

  // Connect to real-time service and fetch jobs
  useEffect(() => {
    const initializeRealTime = () => {
      try {
        // Connect to real-time service
        const socket = realTimeService.connect()
        
        // Check connection status
        setIsConnected(realTimeService.isConnected())
        
        // Get user preferences
        const preferences = getUserPreferences()
        setUserPreferences(preferences)
        
        // Request jobs with real-time updates
        realTimeService.requestJobs(preferences, (jobs) => {
          setJobs(jobs || [])
          setLoading(false)
        })
        
        // Listen for new jobs
        realTimeService.onNewJobs((data) => {
          toast.success(`${data.count} new jobs found!`)
        })
        
        // Listen for scraping status updates
        socket.on('scraping_status', (status) => {
          setScrapingStatus(status.message)
          if (status.status === 'completed') {
            setTimeout(() => setScrapingStatus(''), 3000)
          }
        })
        
        // Get stats
        jobApi.getJobStats().then(response => setStats(response.data || {}))
        
      } catch (error) {
        console.error('Failed to initialize real-time service:', error)
        // Fallback to regular API
        fetchDataFallback()
      }
    }
    
    const fetchDataFallback = async () => {
      try {
        setLoading(true)
        console.log('Fetching data from backend API...')
        console.log('API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:5002/api')
        
        const [jobsResponse, statsResponse] = await Promise.all([
          jobApi.getJobs(),
          jobApi.getJobStats()
        ])
        
        console.log('Jobs response:', jobsResponse)
        console.log('Stats response:', statsResponse)
        
        setJobs(jobsResponse.data || [])
        setStats(statsResponse.data || {})
      } catch (error) {
        console.error('Failed to fetch data:', error)
        console.error('Error details:', error.response?.data || error.message)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    initializeRealTime()
    
    // Cleanup on unmount
    return () => {
      realTimeService.disconnect()
    }
  }, [])


  const filteredJobs = jobs.filter(job => {
    // Basic filters
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || job.type === selectedType
    const matchesRemote = !showRemoteOnly || job.remote

    // Advanced filters
    const jobSalary = extractSalary(job)
    const matchesSalary = jobSalary >= filters.salaryRange[0] && jobSalary <= filters.salaryRange[1]
    
    const companySize = getCompanySize(job.company)
    const matchesCompanySize = filters.companySize.length === 0 || filters.companySize.includes(companySize)
    
    const matchesWorkArrangement = filters.workArrangement.length === 0 || 
      (filters.workArrangement.includes('remote') && job.remote) ||
      (filters.workArrangement.includes('onsite') && !job.remote) ||
      (filters.workArrangement.includes('hybrid') && job.location.toLowerCase().includes('hybrid'))
    
    const matchesIndustry = filters.industry.length === 0 || 
      filters.industry.some(industry => 
        job.title.toLowerCase().includes(industry) ||
        job.description.toLowerCase().includes(industry) ||
        job.company.toLowerCase().includes(industry)
      )
    
    const matchesSkills = filters.skills.length === 0 || 
      filters.skills.some(skill => 
        job.requirements?.some(req => req.toLowerCase().includes(skill.toLowerCase())) ||
        job.description.toLowerCase().includes(skill.toLowerCase())
      )
    
    const matchesLocation = !filters.location || 
      job.location.toLowerCase().includes(filters.location.toLowerCase())

    return matchesSearch && matchesType && matchesRemote && 
           matchesSalary && matchesCompanySize && matchesWorkArrangement &&
           matchesIndustry && matchesSkills && matchesLocation
  })

  const jobTypes = ['internship', 'full-time', 'part-time']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Find Your Perfect Job
          </h1>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="w-4 h-4 mr-1" />
                  <span className="text-sm">Live Updates</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <WifiOff className="w-4 h-4 mr-1" />
                  <span className="text-sm">Offline Mode</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Discover opportunities from top companies around the world
          </p>
          {scrapingStatus && (
            <div className="mt-2 text-sm text-blue-600">
              {scrapingStatus}
            </div>
          )}
        </div>

        {/* User Preferences Info */}
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  🎯 Personalized Job Matching
                </h3>
                <p className="text-sm text-blue-700">
                  Jobs are being matched based on your preferences: {userPreferences.industry} • {userPreferences.skills.join(', ')}
                  {userPreferences.location && ` • ${userPreferences.location}`}
                </p>
              </div>
              <Link
                to="/profile"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Update Preferences →
              </Link>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search internships, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Job Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Quick Filters */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowRemoteOnly(!showRemoteOnly)}
                className={`btn ${showRemoteOnly ? 'btn-primary' : 'btn-secondary'}`}
              >
                Remote
              </button>
                <button
                  onClick={() => setShowAdvancedFilters(true)}
                  className="btn-outline flex items-center"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Advanced Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              filteredJobs.map(job => (
                <div key={job.id} className="card-hover p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        <Link 
                          to={`/jobs/${job.id}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {job.title}
                        </Link>
                      </h3>
                      <p className="text-lg text-gray-600 mb-2">{job.company}</p>
                      <div className="flex items-center text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {job.type}
                        </div>
                        {job.salary && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {job.salary}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveJob(job.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            savedJobs.has(job.id)
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={savedJobs.has(job.id) ? 'Remove from saved' : 'Save job'}
                        >
                          {savedJobs.has(job.id) ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => window.open(job.sourceUrl, '_blank')}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Apply on company website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="badge-primary">{job.source}</span>
                      {job.remote && (
                        <span className="badge-secondary">Remote</span>
                      )}
                      {job.salary ? (
                        <span className="badge-success">Paid</span>
                      ) : (
                        <span className="badge-warning">Salary not specified</span>
                      )}
                      {applications.has(job.id) && (
                        <span className={`badge ${
                          applications.get(job.id)?.status === 'applied' ? 'badge-info' :
                          applications.get(job.id)?.status === 'interview' ? 'badge-warning' :
                          applications.get(job.id)?.status === 'offer' ? 'badge-success' :
                          'badge-error'
                        }`}>
                          {applications.get(job.id)?.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {job.requirements?.slice(0, 3).map((req, index) => (
                        <span key={index} className="badge-secondary text-xs">
                          {req}
                        </span>
                      ))}
                      {job.requirements && job.requirements.length > 3 && (
                        <span className="badge-secondary text-xs">
                          +{job.requirements.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {!applications.has(job.id) && (
                        <button
                          onClick={() => {
                            setSelectedJob(job)
                            setShowApplicationPlanner(true)
                          }}
                          className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Apply Now
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const url = job.sourceUrl || 
                            (job.company.includes('Google') ? 'https://careers.google.com/jobs/results/?location=Singapore&q=intern' :
                             job.company.includes('Microsoft') ? 'https://careers.microsoft.com/us/en/search-results?keywords=intern&location=singapore' :
                             job.company.includes('Amazon') ? 'https://www.amazon.jobs/en/search?base_query=intern&loc_query=singapore' :
                             job.company.includes('Grab') ? 'https://grab.careers/jobs/' :
                             job.company.includes('Shopee') ? 'https://careers.shopee.sg/jobs/' :
                             job.company.includes('DBS') ? 'https://www.dbs.com/careers/default.page' :
                             job.company.includes('OCBC') ? 'https://www.ocbc.com/group/careers/' :
                             job.company.includes('UOB') ? 'https://www.uobgroup.com/uobgroup/careers/' :
                             job.company.includes('GovTech') ? 'https://www.tech.gov.sg/careers/' :
                             job.company.includes('Enterprise') ? 'https://www.enterprisesg.gov.sg/careers' :
                             job.company.includes('A*STAR') ? 'https://www.a-star.edu.sg/careers' :
                             job.company.includes('Carousell') ? 'https://careers.carousell.com/' :
                             job.company.includes('99.co') ? 'https://99.co/singapore/careers' :
                             job.company.includes('Ninja Van') ? 'https://www.ninjavan.co/en-sg/careers' :
                             job.company.includes('McKinsey') ? 'https://www.mckinsey.com/careers/search-jobs' :
                             job.company.includes('PwC') ? 'https://www.pwc.com/sg/en/careers.html' :
                             job.company.includes('Allen') ? 'https://www.allenandgledhill.com/careers/' :
                             job.company.includes('National University Hospital') ? 'https://www.nuh.com.sg/careers/' :
                             job.company.includes('Remote') ? 'https://remote.co/remote-jobs/' :
                             `https://${job.company.toLowerCase().replace(/\s+/g, '')}.com/careers`)
                          window.open(url, '_blank')
                        }}
                        className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        View Original
                      </button>
                    <Link
                        to={`/jobs/${job.id}`}
                        className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                    >
                      View Details
                    </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Tracker */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Tracker</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Saved Jobs</span>
                  <span className="font-medium">{savedJobs.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applied</span>
                  <span className="font-medium">{Array.from(applications.values()).filter(app => app.status === 'applied').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interviews</span>
                  <span className="font-medium">{Array.from(applications.values()).filter(app => app.status === 'interview').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Offers</span>
                  <span className="font-medium">{Array.from(applications.values()).filter(app => app.status === 'offer').length}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Jobs</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Positions</span>
                  <span className="font-medium">{stats.paid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remote Positions</span>
                  <span className="font-medium">{stats.remote}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Filtered Results</span>
                  <span className="font-medium">{filteredJobs.length}</span>
                </div>
              </div>
            </div>

            {/* Job Types */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Types</h3>
              <div className="space-y-2">
                {jobTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(selectedType === type ? '' : type)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedType === type
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(filters.salaryRange[0] > 0 || filters.salaryRange[1] < 10000 || 
              filters.companySize || filters.workArrangement || filters.industry || 
              filters.skills.length > 0 || filters.location) && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Filters</h3>
                <div className="space-y-2">
                  {filters.salaryRange[0] > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Salary</span>
                      <span className="text-sm font-medium">S${filters.salaryRange[0]} - S${filters.salaryRange[1]}</span>
                    </div>
                  )}
                  {filters.companySize && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Company Size</span>
                      <span className="text-sm font-medium capitalize">{filters.companySize}</span>
                    </div>
                  )}
                  {filters.workArrangement && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Work Type</span>
                      <span className="text-sm font-medium capitalize">{filters.workArrangement}</span>
                    </div>
                  )}
                  {filters.industry && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Industry</span>
                      <span className="text-sm font-medium capitalize">{filters.industry}</span>
                    </div>
                  )}
                  {filters.skills.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Skills</span>
                      <span className="text-sm font-medium">{filters.skills.length} selected</span>
                    </div>
                  )}
                  {filters.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Location</span>
                      <span className="text-sm font-medium">{filters.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowAdvancedFilters(false)}
        isOpen={showAdvancedFilters}
      />
      
      {selectedJob && (
        <ApplicationPlanner
          job={selectedJob}
          isOpen={showApplicationPlanner}
          onClose={() => {
            setShowApplicationPlanner(false)
            setSelectedJob(null)
          }}
          onApply={applyToJob}
        />
      )}
    </div>
  )
}
