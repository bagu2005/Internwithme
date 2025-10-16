import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Building, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Application {
  jobId: string
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
  appliedDate: string
  notes: string
  job: {
    id: string
    title: string
    company: string
    location: string
    salary?: string
    type: string
    description: string
    sourceUrl?: string
    source: string
  }
}

interface SavedJob {
  jobId: string
  savedDate: string
  job: {
    id: string
    title: string
    company: string
    location: string
    salary?: string
    type: string
    description: string
    sourceUrl?: string
    source: string
  }
}

export default function MyApplicationsPage() {
  const [activeTab, setActiveTab] = useState<'applied' | 'saved'>('applied')
  const [applications, setApplications] = useState<Application[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)

  // Load data from localStorage (in a real app, this would come from an API)
  useEffect(() => {
    const loadData = () => {
      try {
        const savedApplications = localStorage.getItem('applications')
        const savedJobsData = localStorage.getItem('savedJobs')
        
        if (savedApplications) {
          setApplications(JSON.parse(savedApplications))
        }
        
        if (savedJobsData) {
          setSavedJobs(JSON.parse(savedJobsData))
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'interview':
        return <Calendar className="w-4 h-4 text-yellow-500" />
      case 'offer':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'withdrawn':
        return <AlertCircle className="w-4 h-4 text-gray-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800'
      case 'interview':
        return 'bg-yellow-100 text-yellow-800'
      case 'offer':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const updateApplicationStatus = (jobId: string, newStatus: Application['status']) => {
    setApplications(prev => prev.map(app => 
      app.jobId === jobId 
        ? { ...app, status: newStatus }
        : app
    ))
    
    // Save to localStorage
    const updatedApplications = applications.map(app => 
      app.jobId === jobId 
        ? { ...app, status: newStatus }
        : app
    )
    localStorage.setItem('applications', JSON.stringify(updatedApplications))
    
    toast.success(`Application status updated to ${newStatus}`)
  }

  const removeSavedJob = (jobId: string) => {
    setSavedJobs(prev => prev.filter(job => job.jobId !== jobId))
    
    // Save to localStorage
    const updatedSavedJobs = savedJobs.filter(job => job.jobId !== jobId)
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs))
    
    toast.success('Job removed from saved list')
  }

  const removeApplication = (jobId: string) => {
    setApplications(prev => prev.filter(app => app.jobId !== jobId))
    
    // Save to localStorage
    const updatedApplications = applications.filter(app => app.jobId !== jobId)
    localStorage.setItem('applications', JSON.stringify(updatedApplications))
    
    toast.success('Application removed')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-lg text-gray-600">Track your job applications and saved positions</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('applied')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applied'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Applied Jobs ({applications.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'saved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Saved Jobs ({savedJobs.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Applied Jobs Tab */}
        {activeTab === 'applied' && (
          <div>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-6">Start applying to jobs to see them here</p>
                <Link
                  to="/internships"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((application) => (
                  <div key={application.jobId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {application.job.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1 capitalize">{application.status}</span>
                          </span>
                        </div>
                        <p className="text-lg text-gray-600 mb-2">{application.job.company}</p>
                        <div className="flex items-center text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {application.job.location}
                          </div>
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {application.job.type}
                          </div>
                          {application.job.salary && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {application.job.salary}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Applied {new Date(application.appliedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{application.job.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <select
                          value={application.status}
                          onChange={(e) => updateApplicationStatus(application.jobId, e.target.value as Application['status'])}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="applied">Applied</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Rejected</option>
                          <option value="withdrawn">Withdrawn</option>
                        </select>
                        
                        {application.job.sourceUrl && (
                          <button
                            onClick={() => window.open(application.job.sourceUrl, '_blank')}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Original
                          </button>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeApplication(application.jobId)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Jobs Tab */}
        {activeTab === 'saved' && (
          <div>
            {savedJobs.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
                <p className="text-gray-600 mb-6">Save jobs you're interested in to view them here</p>
                <Link
                  to="/internships"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {savedJobs.map((savedJob) => (
                  <div key={savedJob.jobId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {savedJob.job.title}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <BookmarkCheck className="w-4 h-4 mr-1" />
                            Saved
                          </span>
                        </div>
                        <p className="text-lg text-gray-600 mb-2">{savedJob.job.company}</p>
                        <div className="flex items-center text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {savedJob.job.location}
                          </div>
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {savedJob.job.type}
                          </div>
                          {savedJob.job.salary && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {savedJob.job.salary}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Saved {new Date(savedJob.savedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{savedJob.job.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Link
                          to={`/jobs/${savedJob.job.id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                        
                        {savedJob.job.sourceUrl && (
                          <button
                            onClick={() => window.open(savedJob.job.sourceUrl, '_blank')}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Original
                          </button>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeSavedJob(savedJob.jobId)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
