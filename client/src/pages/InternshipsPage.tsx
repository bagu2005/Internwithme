import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Clock, DollarSign, Building, Filter, RefreshCw } from 'lucide-react'
import { jobService } from '../services/supabase'
import { toast } from 'react-hot-toast'

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

export default function InternshipsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, internships: 0, remote: 0, paid: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showRemoteOnly, setShowRemoteOnly] = useState(false)

  // Fetch jobs and stats on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [jobs, jobStats] = await Promise.all([
          jobService.getJobs(),
          jobService.getJobStats()
        ])
        setJobs(jobs || [])
        setStats(jobStats)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        // Fallback to empty array if API fails
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])


  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || job.type === selectedType
    const matchesRemote = !showRemoteOnly || job.remote

    return matchesSearch && matchesType && matchesRemote
  })

  const jobTypes = ['internship', 'full-time', 'part-time']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Job
          </h1>
          <p className="text-lg text-gray-600">
            Discover opportunities from top companies around the world
          </p>
        </div>

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
                      <span className="badge-primary">{job.source}</span>
                      {job.remote && (
                        <span className="badge-secondary">Remote</span>
                      )}
                      {job.salary ? (
                        <span className="badge-success">Paid</span>
                      ) : (
                        <span className="badge-warning">Salary not specified</span>
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
                    
                    <Link
                      to={`/jobs/${job.id}`}
                      className="btn-outline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
          </div>
        </div>
      </div>
    </div>
  )
}
